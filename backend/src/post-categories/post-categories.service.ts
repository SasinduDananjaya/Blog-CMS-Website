import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostCategoryDto } from './dto/create-post-category.dto';
import { UpdatePostCategoryDto } from './dto/update-post-category.dto';
import { PostStatus } from '../../prisma/generated/client';
import { NewPostCategoryStatusDto } from './dto/new-post-category-status-change.dto';

@Injectable()
export class PostCategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(
    createPostCategoryDto: CreatePostCategoryDto,
    creatorUuid: string,
  ) {
    const existingCategory = await this.prisma.postCategory.findUnique({
      where: { name: createPostCategoryDto.name },
    });

    if (existingCategory) {
      throw new ConflictException('Category name already exists');
    }

    return this.prisma.postCategory.create({
      data: {
        ...createPostCategoryDto,
        createdBy: creatorUuid,
      },
      include: {
        creator: {
          select: {
            uuid: true,
            name: true,
          },
        },
        _count: {
          select: { posts: true },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.postCategory.findMany({
      include: {
        creator: {
          select: {
            uuid: true,
            name: true,
          },
        },
        _count: {
          select: { posts: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(uuid: string, includePublishedPosts = false) {
    const category = await this.prisma.postCategory.findUnique({
      where: { uuid },
      include: {
        creator: {
          select: {
            uuid: true,
            name: true,
          },
        },
        ...(includePublishedPosts && {
          posts: {
            where: { status: PostStatus.PUBLISHED },
            include: {
              author: {
                select: {
                  uuid: true,
                  name: true,
                },
              },
              postTags: {
                include: {
                  tag: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        }),
        _count: {
          select: { posts: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category.posts) {
      category.posts = category.posts.map((post: any) => {
        const { postTags, ...rest } = post;
        return {
          ...rest,
          tags: postTags?.map((pt: any) => pt.tag) || [],
        };
      });
    }

    return category;
  }

  async update(uuid: string, updatePostCategoryDto: UpdatePostCategoryDto) {
    const category = await this.prisma.postCategory.findUnique({
      where: { uuid },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (updatePostCategoryDto.name) {
      const existingCategory = await this.prisma.postCategory.findFirst({
        where: {
          name: updatePostCategoryDto.name,
          uuid: { not: uuid },
        },
      });

      if (existingCategory) {
        throw new ConflictException('Category name already exists');
      }
    }

    return this.prisma.postCategory.update({
      where: { uuid },
      data: updatePostCategoryDto,
      include: {
        creator: {
          select: {
            uuid: true,
            name: true,
          },
        },
        _count: {
          select: { posts: true },
        },
      },
    });
  }

  async changeStatus(uuid: string, changeStatusDto: NewPostCategoryStatusDto) {
    const category = await this.prisma.postCategory.findUnique({
      where: { uuid },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.prisma.postCategory.update({
      where: { uuid },
      data: {
        newStatus: changeStatusDto.newStatus,
      },
      include: {
        creator: {
          select: {
            uuid: true,
            name: true,
          },
        },
        _count: {
          select: { posts: true },
        },
      },
    });
  }

  async remove(uuid: string) {
    const category = await this.prisma.postCategory.findUnique({
      where: { uuid },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    await this.prisma.postCategory.delete({
      where: { uuid },
    });

    return { message: 'Category deleted successfully' };
  }
}

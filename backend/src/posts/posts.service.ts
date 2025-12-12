import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseStorageService } from '../supabase/supabase-storage.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { UpdatePostStatusDto } from './dto/update-post-status.dto';
import { PostQueryDto } from './dto/post-query.dto';
import { PostStatus, UserRole } from '../../prisma/generated/client';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private supabaseStorage: SupabaseStorageService,
  ) {}

  async create(
    createPostDto: CreatePostDto,
    authorUuid: string,
    image?: Express.Multer.File,
  ) {
    const { tagUuids, ...postData } = createPostDto;

    let imageUrl: string | undefined;
    if (image) {
      imageUrl = await this.supabaseStorage.uploadImage(image);
    }

    //check category exists or not
    if (postData.categoryUuid) {
      const category = await this.prisma.postCategory.findUnique({
        where: { uuid: postData.categoryUuid },
      });
      if (!category) {
        throw new NotFoundException('Post Category not found');
      }
    }

    //check all tags exists or not
    if (tagUuids?.length) {
      const tags = await this.prisma.tag.findMany({
        where: { uuid: { in: tagUuids } },
      });
      if (tags.length !== tagUuids.length) {
        throw new NotFoundException('One or more tags not found');
      }
    }

    const post = await this.prisma.post.create({
      data: {
        ...postData,
        authorUuid,
        imageUrl,
        postTags: tagUuids?.length
          ? {
              create: tagUuids.map((tagUuid) => ({
                tag: { connect: { uuid: tagUuid } },
              })),
            }
          : undefined,
      },
      include: {
        author: {
          select: {
            uuid: true,
            name: true,
            email: true,
          },
        },
        category: true,
        postTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return this.formatPostResponse(post);
  }

  async findAll(query: PostQueryDto, userUuid?: string, userRole?: UserRole) {
    const { status, categoryUuid, search, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    let whereClause: any = {};

    //return published posts
    if (!userUuid) {
      whereClause.status = PostStatus.PUBLISHED;
    } else if (userRole === UserRole.ADMIN) {
      //view all posts by admin and filter by status
      if (status) {
        whereClause.status = status;
      }
    } else {
      //regular user can see their own posts and other published posts
      if (status) {
        whereClause = {
          AND: [
            { status },
            {
              OR: [{ authorUuid: userUuid }, { status: PostStatus.PUBLISHED }],
            },
          ],
        };
      } else {
        whereClause.OR = [
          { authorUuid: userUuid },
          { status: PostStatus.PUBLISHED },
        ];
      }
    }

    //category filter
    if (categoryUuid) {
      whereClause.categoryUuid = categoryUuid;
    }

    //search filter
    if (search) {
      whereClause.AND = [
        ...(whereClause.AND || []),
        {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } },
          ],
        },
      ];
    }

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where: whereClause,
        include: {
          author: {
            select: {
              uuid: true,
              name: true,
            },
          },
          category: true,
          postTags: {
            include: {
              tag: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.post.count({ where: whereClause }),
    ]);

    return {
      data: posts.map((post) => this.formatPostResponse(post)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findPublished(query: PostQueryDto) {
    const { categoryUuid, search, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    let whereClause: any = {
      status: PostStatus.PUBLISHED,
    };

    if (categoryUuid) {
      whereClause.categoryUuid = categoryUuid;
    }

    if (search) {
      whereClause.AND = [
        {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } },
          ],
        },
      ];
    }

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where: whereClause,
        include: {
          author: {
            select: {
              uuid: true,
              name: true,
            },
          },
          category: true,
          postTags: {
            include: {
              tag: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.post.count({ where: whereClause }),
    ]);

    return {
      data: posts.map((post) => this.formatPostResponse(post)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(uuid: string, userUuid?: string, userRole?: UserRole) {
    const post = await this.prisma.post.findUnique({
      where: { uuid },
      include: {
        author: {
          select: {
            uuid: true,
            name: true,
            email: true,
          },
        },
        category: true,
        postTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    //post published -> then anyone can view it
    if (post.status === PostStatus.PUBLISHED) {
      return this.formatPostResponse(post);
    }

    //draft post then only owner or admin can view
    if (!userUuid) {
      throw new ForbiddenException('Please logged in to view this post');
    }

    if (userRole !== UserRole.ADMIN && post.authorUuid !== userUuid) {
      throw new ForbiddenException('You can only view your own draft posts');
    }

    return this.formatPostResponse(post);
  }

  async findMyPosts(authorUuid: string, query: PostQueryDto) {
    const { status, categoryUuid, search, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    let whereClause: any = { authorUuid };

    if (status) {
      whereClause.status = status;
    }

    if (categoryUuid) {
      whereClause.categoryUuid = categoryUuid;
    }

    if (search) {
      whereClause.AND = [
        {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } },
          ],
        },
      ];
    }

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where: whereClause,
        include: {
          category: true,
          postTags: {
            include: {
              tag: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.post.count({ where: whereClause }),
    ]);

    return {
      data: posts.map((post) => this.formatPostResponse(post)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(
    uuid: string,
    updatePostDto: UpdatePostDto,
    userUuid: string,
    userRole: UserRole,
    image?: Express.Multer.File,
  ) {
    const post = await this.prisma.post.findUnique({
      where: { uuid },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    //check owner
    if (userRole !== UserRole.ADMIN && post.authorUuid !== userUuid) {
      throw new ForbiddenException('You can only update your own posts');
    }

    const { tagUuids, removeImage, ...postData } = updatePostDto;

    let imageUrl: string | undefined;

    //remove existing image
    if (removeImage && post.imageUrl) {
      await this.supabaseStorage.deleteImage(post.imageUrl);
      imageUrl = null;
    }

    //upload new image
    if (image) {
      //remove existing image first
      if (post.imageUrl) {
        await this.supabaseStorage.deleteImage(post.imageUrl);
      }
      imageUrl = await this.supabaseStorage.uploadImage(image);
    }

    //category exists or not
    if (postData.categoryUuid) {
      const category = await this.prisma.postCategory.findUnique({
        where: { uuid: postData.categoryUuid },
      });
      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    //post tags exists or not
    if (tagUuids !== undefined) {
      if (tagUuids.length > 0) {
        const tags = await this.prisma.tag.findMany({
          where: { uuid: { in: tagUuids } },
        });
        if (tags.length !== tagUuids.length) {
          throw new NotFoundException('One or more tags not found');
        }
      }

      //delete existing tags
      await this.prisma.postTag.deleteMany({
        where: { postUuid: uuid },
      });
    }

    const updatedPost = await this.prisma.post.update({
      where: { uuid },
      data: {
        ...postData,
        ...(imageUrl !== undefined && { imageUrl }),
        ...(tagUuids !== undefined && {
          postTags: {
            create: tagUuids.map((tagUuid) => ({
              tag: { connect: { uuid: tagUuid } },
            })),
          },
        }),
      },
      include: {
        author: {
          select: {
            uuid: true,
            name: true,
            email: true,
          },
        },
        category: true,
        postTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return this.formatPostResponse(updatedPost);
  }

  async updateStatus(
    uuid: string,
    updatePostStatusDto: UpdatePostStatusDto,
    userUuid: string,
    userRole: UserRole,
  ) {
    const post = await this.prisma.post.findUnique({
      where: { uuid },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    //check owner
    if (userRole !== UserRole.ADMIN && post.authorUuid !== userUuid) {
      throw new ForbiddenException(
        'You can only update status of your own posts',
      );
    }

    const updatedPost = await this.prisma.post.update({
      where: { uuid },
      data: { status: updatePostStatusDto.status },
      include: {
        author: {
          select: {
            uuid: true,
            name: true,
          },
        },
        category: true,
        postTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return this.formatPostResponse(updatedPost);
  }

  async remove(uuid: string, userUuid: string, userRole: UserRole) {
    const post = await this.prisma.post.findUnique({
      where: { uuid },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (userRole !== UserRole.ADMIN && post.authorUuid !== userUuid) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    if (post.imageUrl) {
      await this.supabaseStorage.deleteImage(post.imageUrl);
    }

    await this.prisma.post.delete({
      where: { uuid },
    });

    return { message: 'Post deleted successfully' };
  }

  private formatPostResponse(post: any) {
    const { postTags, ...rest } = post;
    return {
      ...rest,
      tags: postTags?.map((pt: any) => pt.tag) || [],
    };
  }
}

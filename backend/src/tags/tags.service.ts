import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { NewTagStatusDto } from './dto/new-tag-status-change.dto';

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  async create(createTagDto: CreateTagDto) {
    const existingTag = await this.prisma.tag.findUnique({
      where: { name: createTagDto.name },
    });

    if (existingTag) {
      throw new ConflictException('Tag with name already exists');
    }

    return this.prisma.tag.create({
      data: createTagDto,
    });
  }

  async findAll() {
    return this.prisma.tag.findMany({
      include: {
        _count: {
          select: { postTags: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(uuid: string) {
    const tag = await this.prisma.tag.findUnique({
      where: { uuid },
      include: {
        _count: {
          select: { postTags: true },
        },
      },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    return tag;
  }

  async update(uuid: string, updateTagDto: UpdateTagDto) {
    const tag = await this.prisma.tag.findUnique({
      where: { uuid },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    if (updateTagDto.name) {
      const existingTag = await this.prisma.tag.findFirst({
        where: {
          name: updateTagDto.name,
          uuid: { not: uuid },
        },
      });

      if (existingTag) {
        throw new ConflictException('Tag with name already exists');
      }
    }

    return this.prisma.tag.update({
      where: { uuid },
      data: updateTagDto,
    });
  }

  async changeStatus(uuid: string, changeStatusDto: NewTagStatusDto) {
    const tag = await this.prisma.tag.findUnique({
      where: { uuid },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    return this.prisma.tag.update({
      where: { uuid },
      data: {
        newStatus: changeStatusDto.newStatus,
      },
      include: {
        _count: {
          select: { postTags: true },
        },
      },
    });
  }

  async remove(uuid: string) {
    const tag = await this.prisma.tag.findUnique({
      where: { uuid },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    await this.prisma.tag.delete({
      where: { uuid },
    });

    return { message: 'Tag deleted successfully' };
  }
}

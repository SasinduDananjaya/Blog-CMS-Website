import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { PostCategoriesService } from './post-categories.service';
import { CreatePostCategoryDto } from './dto/create-post-category.dto';
import { UpdatePostCategoryDto } from './dto/update-post-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../../prisma/generated/client';

@Controller('post-categories')
export class PostCategoriesController {
  constructor(private readonly postCategoriesService: PostCategoriesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(
    @Body() createPostCategoryDto: CreatePostCategoryDto,
    @CurrentUser() user: any,
  ) {
    return this.postCategoriesService.create(createPostCategoryDto, user.uuid);
  }

  @Get()
  findAll() {
    return this.postCategoriesService.findAll();
  }

  @Get(':uuid')
  findOne(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Query('includePosts') includePosts?: string,
  ) {
    return this.postCategoriesService.findOne(uuid, includePosts === 'true');
  }

  @Patch(':uuid')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() updatePostCategoryDto: UpdatePostCategoryDto,
  ) {
    return this.postCategoriesService.update(uuid, updatePostCategoryDto);
  }

  @Delete(':uuid')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return this.postCategoriesService.remove(uuid);
  }
}

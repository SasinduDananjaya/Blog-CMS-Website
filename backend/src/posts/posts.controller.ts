import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { UpdatePostStatusDto } from './dto/update-post-status.dto';
import { PostQueryDto } from './dto/post-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CommonGuard } from '../auth/guards/common.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() createPostDto: CreatePostDto,
    @CurrentUser() user: any,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|gif|webp)$/ }),
        ],
        fileIsRequired: false,
      }),
    )
    image?: Express.Multer.File,
  ) {
    return this.postsService.create(createPostDto, user.uuid, image);
  }

  @Get()
  @UseGuards(CommonGuard)
  findAll(@Query() query: PostQueryDto, @CurrentUser() user: any) {
    return this.postsService.findAll(query, user?.uuid, user?.role);
  }

  @Get('published')
  findPublished(@Query() query: PostQueryDto) {
    return this.postsService.findPublished(query);
  }

  @Get('my-posts')
  @UseGuards(JwtAuthGuard)
  findMyPosts(@Query() query: PostQueryDto, @CurrentUser() user: any) {
    return this.postsService.findMyPosts(user.uuid, query);
  }

  @Get(':uuid')
  @UseGuards(CommonGuard)
  findOne(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @CurrentUser() user: any,
  ) {
    return this.postsService.findOne(uuid, user?.uuid, user?.role);
  }

  @Patch(':uuid')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() updatePostDto: UpdatePostDto,
    @CurrentUser() user: any,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|gif|webp)$/ }),
        ],
        fileIsRequired: false,
      }),
    )
    image?: Express.Multer.File,
  ) {
    return this.postsService.update(
      uuid,
      updatePostDto,
      user.uuid,
      user.role,
      image,
    );
  }

  @Patch(':uuid/status')
  @UseGuards(JwtAuthGuard)
  updateStatus(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() updatePostStatusDto: UpdatePostStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.postsService.updateStatus(
      uuid,
      updatePostStatusDto,
      user.uuid,
      user.role,
    );
  }

  @Delete(':uuid')
  @UseGuards(JwtAuthGuard)
  remove(@Param('uuid', ParseUUIDPipe) uuid: string, @CurrentUser() user: any) {
    return this.postsService.remove(uuid, user.uuid, user.role);
  }
}

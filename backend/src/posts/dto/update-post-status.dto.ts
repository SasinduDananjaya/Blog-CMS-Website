import { IsEnum } from 'class-validator';
import { PostStatus } from '../../../prisma/generated/client';

export class UpdatePostStatusDto {
  @IsEnum(PostStatus)
  status: PostStatus;
}

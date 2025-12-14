import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  MinLength,
  IsArray,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { PostStatus } from '../../../prisma/generated/client';

export class CreatePostDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  content: string;

  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @IsOptional()
  @IsUUID()
  categoryUuid?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value.split(',').map((v: string) => v.trim());
      }
    }
    return value;
  })
  tagUuids?: string[];
}

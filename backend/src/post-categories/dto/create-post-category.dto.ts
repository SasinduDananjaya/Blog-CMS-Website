import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreatePostCategoryDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;
}

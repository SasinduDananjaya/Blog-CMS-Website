import { IsEnum, IsNotEmpty } from 'class-validator';
import { Status } from '../../../prisma/generated/client';

export class NewPostCategoryStatusDto {
  @IsNotEmpty()
  @IsEnum(Status)
  newStatus: Status;
}

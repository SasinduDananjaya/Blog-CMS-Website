import { IsEnum, IsNotEmpty } from 'class-validator';
import { Status } from '../../../prisma/generated/client';

export class NewTagStatusDto {
  @IsNotEmpty()
  @IsEnum(Status)
  newStatus: Status;
}

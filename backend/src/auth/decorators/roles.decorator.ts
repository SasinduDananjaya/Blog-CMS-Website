import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../../prisma/generated/client';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);

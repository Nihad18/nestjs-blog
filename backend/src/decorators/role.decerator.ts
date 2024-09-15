import { SetMetadata } from '@nestjs/common';
import { RoleEnum } from '../enums/role.enum';

export const RoleDecerator = (roles: RoleEnum[]) => SetMetadata('roles', roles);

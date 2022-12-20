import { SetMetadata } from '@nestjs/common';
import { Role } from '@price-map/core/enums';
import { roleKey } from '../constants';

export const Roles = (...roles: Role[]) => SetMetadata(roleKey, roles);

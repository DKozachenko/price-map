import { CustomDecorator, SetMetadata } from '@nestjs/common';
import { Role } from '@core/enums';
import { roleKey } from '../constants';

/**
 * Декоратор для требуемых полей
 * @export
 * @type { (...roles: Role[]): CustomDecorator<string> }
 */
export const Roles = (...roles: Role[]): CustomDecorator<string> => SetMetadata(roleKey, roles);

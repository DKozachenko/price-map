import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class JustPipe implements PipeTransform {
  transform(value: number, metadata: ArgumentMetadata) {
    if (value > 100) {
      throw new BadRequestException('Validation failed')
    }
    return value;
  }
}

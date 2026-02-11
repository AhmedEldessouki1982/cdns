import { PartialType } from '@nestjs/mapped-types';
import { CreateTodDto } from './create-tod.dto';

export class UpdateTodDto extends PartialType(CreateTodDto) {}

import { PartialType } from '@nestjs/mapped-types';
import { CreateAuthSignUpDto, CreateAuthLoginDto } from './create-auth.dto';

export class UpdateAuthSignUpDto extends PartialType(CreateAuthSignUpDto) {}
export class UpdateAuthLoginDto extends PartialType(CreateAuthLoginDto) {}

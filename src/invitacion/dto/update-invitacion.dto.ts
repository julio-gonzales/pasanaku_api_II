import { PartialType } from '@nestjs/mapped-types';
import { CreateInvitacionDto } from './create-invitacion.dto';

export class UpdateParticipanteDto extends PartialType(CreateInvitacionDto) {}

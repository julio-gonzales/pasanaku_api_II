import { Module } from '@nestjs/common';
import { InvitacionController } from './invitacion.controller';
import { InvitacionService } from './invitacion.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Invitacion } from './entities/invitacion.entity';
import { Participante } from 'src/participante/entities/participante.entity';
import { Jugador } from 'src/jugadores/entities/jugador.entity';
import { NotificationModule } from 'src/notification/notification.module';
import { MailModule } from 'src/mail/mail.module';
import { ParticipanteModule } from 'src/participante/participante.module';


@Module({
  controllers: [InvitacionController],
  providers: [InvitacionService],
  imports: [
    NotificationModule,
    MailModule,
    ParticipanteModule,
    TypeOrmModule.forFeature([ Jugador, Invitacion, Participante ])
  ],
  exports: [ 
    TypeOrmModule,
    InvitacionService,
  ]

})
export class InvitacionModule {}

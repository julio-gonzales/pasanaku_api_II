import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { JugadoresModule } from 'src/jugadores/jugadores.module';

import { Invitacion } from 'src/invitacion/entities/invitacion.entity';
import { Partida } from 'src/partida/entities/partida.entity';
import { Jugador } from 'src/jugadores/entities/jugador.entity';
import { Notificacion } from './entities/notificacion.entity';

@Module({
  controllers: [NotificationController],
  providers: [NotificationService],
  imports: [
    JugadoresModule,
    TypeOrmModule.forFeature([Notificacion,Invitacion,Partida,Jugador])    
  ],
  exports: [NotificationService],
})
export class NotificationModule {}

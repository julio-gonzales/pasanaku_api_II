import { Module } from '@nestjs/common';
import { ParticipanteService } from './participante.service';
import { ParticipanteController } from './participante.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NotificationModule } from 'src/notification/notification.module';
import { TransferenciaModule } from 'src/transferencia/transferencia.module';

import { Participante } from './entities/participante.entity';
import { Partida } from 'src/partida/entities/partida.entity';
import { Jugador } from 'src/jugadores/entities/jugador.entity';
import { Cuenta } from 'src/cuenta/entities/cuenta.entity';
import { Role } from 'src/roles/entities/role.entity';
import { Subasta } from 'src/subasta/entities/subasta.entity';
import { Transferencia } from 'src/transferencia/entities/transferencia.entity';


@Module({
  providers: [ParticipanteService],
  controllers: [ParticipanteController],
  imports: [
    NotificationModule,
    TransferenciaModule,
    TypeOrmModule.forFeature([Participante, Partida, Jugador, Cuenta, Role, Subasta,Transferencia]), // Importa las entidades Moneda y Partida
  ],
  exports: [ParticipanteService],
})
export class ParticipanteModule {}

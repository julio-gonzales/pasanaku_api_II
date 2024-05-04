import { Module } from '@nestjs/common';
import { PartidaController } from './partida.controller';
import { PartidaService } from './partida.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParticipanteModule } from 'src/participante/participante.module';
import { InvitacionModule } from 'src/invitacion/invitacion.module';
import { RondaModule } from 'src/ronda/ronda.module';
import { NotificationModule } from 'src/notification/notification.module';


import { Partida } from './entities/partida.entity';
import { Moneda } from 'src/moneda/entities/moneda.entity';
import { Participante } from 'src/participante/entities/participante.entity';


@Module({
  controllers: [PartidaController],
  providers: [PartidaService],
  imports: [
    ParticipanteModule,
    InvitacionModule,
    RondaModule,
    NotificationModule,
    TypeOrmModule.forFeature([Partida,Moneda,Participante])
    
  ]
})
export class PartidaModule {}

import { Module } from '@nestjs/common';
import { OfertaService } from './oferta.service';
import { OfertaController } from './oferta.controller';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Subasta } from 'src/subasta/entities/subasta.entity';
import { Oferta } from './entities/oferta.entity';
import { Participante } from 'src/participante/entities/participante.entity';
import { Jugador } from 'src/jugadores/entities/jugador.entity';


@Module({
  providers: [OfertaService],
  controllers: [OfertaController],
  imports: [
    TypeOrmModule.forFeature([Oferta,Participante,Subasta,Jugador])
    
  ]
})
export class OfertaModule {}

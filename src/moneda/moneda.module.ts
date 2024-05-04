import { Module } from '@nestjs/common';
import { MonedaController } from './moneda.controller';
import { MonedaService } from './moneda.service';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Partida } from 'src/partida/entities/partida.entity';
import { Moneda } from './entities/moneda.entity';


@Module({
  controllers: [MonedaController],
  providers: [MonedaService],
  imports: [
    TypeOrmModule.forFeature([Moneda, Partida]), // Importa las entidades Moneda y Partida
  ],
})
export class MonedaModule {}

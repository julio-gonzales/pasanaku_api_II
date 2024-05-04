import { Module } from '@nestjs/common';
import { CuentaService } from './cuenta.service';
import { CuentaController } from './cuenta.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Cuenta } from './entities/cuenta.entity';
import { Jugador } from '../jugadores/entities/jugador.entity';
import { Banco } from 'src/banco/entities/banco.entity';
import { Participante } from 'src/participante/entities/participante.entity';

@Module({
  controllers: [CuentaController],
  providers: [CuentaService],
  imports: [
    TypeOrmModule.forFeature([ Jugador, Cuenta, Banco, Participante ])
  ]
})
export class CuentaModule {}

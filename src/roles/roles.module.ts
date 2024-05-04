import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';

import { TypeOrmModule } from '@nestjs/typeorm';

import { Role } from './entities/role.entity';
import { Participante } from 'src/participante/entities/participante.entity';

@Module({
  controllers: [RolesController],
  providers: [RolesService],
  imports: [
    TypeOrmModule.forFeature([Role,Participante])
  ]
})
export class RolesModule {}

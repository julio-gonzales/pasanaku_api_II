import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CuentaService } from './cuenta.service';
import { CreateCuentaDto } from './dto/create-cuenta.dto';
import { UpdateCuentaDto } from './dto/update-cuenta.dto';

@Controller('cuenta')
export class CuentaController {
  constructor(private readonly cuentaService: CuentaService) {}

  @Post()
  create(@Body() createCuentaDto: CreateCuentaDto) {
    return this.cuentaService.create(createCuentaDto);
  }

  @Get('jugador/:id')
  findAll(@Param('id') id: number) {
    return this.cuentaService.findAll(+id);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.cuentaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateCuentaDto: UpdateCuentaDto) {
    return this.cuentaService.update(+id, updateCuentaDto);
  }

  @Delete('jugador/:jugadorId/cuenta/:cuentaId')
  remove(@Param('jugadorId') jugadorId: number, @Param('cuentaId') cuentaId: string) {
    return this.cuentaService.deleteCuentaFromJugador(+jugadorId, +cuentaId);
  }
}

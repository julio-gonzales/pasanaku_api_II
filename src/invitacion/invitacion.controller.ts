import { Controller, Get, Post, Body, Patch, Param, Delete, UnauthorizedException, Put } from '@nestjs/common';
import { CreateInvitacionDto } from './dto/create-invitacion.dto';
import { InvitacionService } from './invitacion.service';

@Controller('invitacion')
export class InvitacionController {

  constructor(private readonly invitacionService: InvitacionService) {}

  @Post()
  async create(@Body() createInvitacionDto: CreateInvitacionDto) {
    const invitacionCreado = await this.invitacionService.create(createInvitacionDto);
    return {
      status: 201,
      message: 'Invitacion creado exitosamente',
      data: invitacionCreado,
    };
  }

  @Post('enviar/:id')
  enviar(@Param('id') id: number) {
    return this.invitacionService.enviar(id);
  }

  @Post('enviarTodos/:id')
  enviarTodos(@Param('id') id: number) {
    return this.invitacionService.enviarTodos(id);
  }

  @Get('invitaciones/:id')
  invitaciones(@Param('id') id: number) {
    return this.invitacionService.invitaciones(id);
  }
  
  @Put('aceptar/:id')
  aceptar(@Param('id') id: number) {
    return this.invitacionService.aceptar(id);
  }

  @Put('rechazar/:id')
  rechazar(@Param('id') id: number) {
    return this.invitacionService.rechazar(id);
  }

}

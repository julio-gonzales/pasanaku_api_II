import { Controller,Post,Get, Param, Req, Put } from '@nestjs/common';
import { Request } from 'express';
import { TransferenciaService } from './transferencia.service';

@Controller('transferencia')
export class TransferenciaController {
    constructor(private readonly transferenciaService: TransferenciaService) {}

    //Devuelve transferencias de un jugador
    @Get(':id')
    transferencias(@Param('id') id: number, @Req() req: Request) {
    return this.transferenciaService.transferencias(id,req);
    }

    @Put('pagar/:id')
    pagar(@Param('id') id: number) {
    return this.transferenciaService.pagar(id);
    }

}

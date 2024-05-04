import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { CreateOfertaDto } from './dto/create-oferta.dto';
import { OfertaService } from './oferta.service';

@Controller('oferta')
export class OfertaController {
    constructor(
        private readonly ofertaService: OfertaService,
    
        ) {}
    
      @Post()
      async create(@Body() createOfertaDto: CreateOfertaDto) {
        const oferta = await this.ofertaService.create(createOfertaDto);        
        return {
          status: 200,
          message: oferta,
         };       
      }

      
}

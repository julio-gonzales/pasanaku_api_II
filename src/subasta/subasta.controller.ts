import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { SubastaService } from './subasta.service';

@Controller('subasta')
export class SubastaController {
    constructor(
        private readonly subastaService: SubastaService,
    ) {}

    

    //Devuelve la subasta
    @Get(':id')
    findOne(@Param('id') id: number) {
    return this.subastaService.findOne( id );
    }


    /*
    @Get()
      findAll(){
        return this.subastaService.findAll();
      }
    */
}

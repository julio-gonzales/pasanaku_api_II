import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { readdirSync } from 'fs';
import { join } from 'path';
import { BancoService } from './banco.service';
import { CreateBancoDto } from './dto/create-banco.dto';
import { UpdateBancoDto } from './dto/update-banco.dto';

@Controller('banco')
export class BancoController {
  constructor(private readonly bancoService: BancoService) {}

  @Post()
  create(@Body() createBancoDto: CreateBancoDto) {
    return this.bancoService.create(createBancoDto);
  }

  @Get()
  findAll() {
    const assetsPath = join(__dirname, '..', '..','assets/qr');
    console.log(assetsPath)
    const files = readdirSync(assetsPath); 
    console.log(files)
    return assetsPath;
    //return this.bancoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.bancoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateBancoDto: UpdateBancoDto) {
    return this.bancoService.update(+id, updateBancoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.bancoService.remove(+id);
  }

  @Get('hola/:id')
  hola(@Param('id') id: number)  {
    const files = 'hola'; 
    console.log(files)
    return files;
  }


  @Get('imagenes/:id')
  getFiles(@Param('id') id: number)  {
    const assetsPath = join(__dirname, '..', '..','assets/qr');
    console.log(assetsPath)
    const files = readdirSync(assetsPath); 
    console.log(files)
    return assetsPath;
  }

  @Post('img')
  getFiles2() {
    const assetsPath = join(__dirname, '..', '..','assets/qr');
    console.log(assetsPath)
    const files = readdirSync(assetsPath); 
    console.log(files)
    return files;
  }

  @Put('qr')
  getFiles1() {
    const assetsPath = join(__dirname, '..', '..','assets/qr');
    console.log(assetsPath)
    const files = readdirSync(assetsPath); 
    console.log(files)
    return files;
  }
}

import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UnauthorizedException } from '@nestjs/common';
import { JugadoresService } from './jugadores.service';
import { CreateJugadorDto } from './dto/create-jugador.dto';
import { UpdateJugadorDto } from './dto/update-jugador.dto';
import { LoginJugadorDto } from './dto/login-jugador.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { Request } from 'express';
import { UploadedFile, UseInterceptors } from '@nestjs/common/decorators';
import { BadRequestException, NotFoundException } from '@nestjs/common/exceptions';

function imageFileFilter(
    req: Express.Request,
    file: Express.Multer.File,
    cb: (error: Error | null, acceptFile: boolean) => void,
  ) {
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
    const fileExtension = extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false); // Rechazar el archivo
    }
  }

@Controller('jugadores')
export class JugadoresController {

  constructor(private readonly jugadoresService: JugadoresService) {}

  @Post('register')
  async create(@Body() createJugadorDto: CreateJugadorDto) {
    console.log('Datos recibidos en el cuerpo de la solicitud:', createJugadorDto);
    const jugadorCreado = await this.jugadoresService.create(createJugadorDto);
    return {
      status: 201,
      message: 'Jugador creado exitosamente',
      data: jugadorCreado,
    };
  }

  @Post('login')
  async loginPlayer(@Body() loginJugadorDto: LoginJugadorDto) {
    const jugadorLogueado = await this.jugadoresService.login(loginJugadorDto);
    return {
      status: 201,
      message: 'Jugador logueado exitosamente',
      data: jugadorLogueado,
    };
    
  }


  @Get()
  async findAll() {
    const jugadores = await this.jugadoresService.findAll();
    return {
      status: 200,
      message: 'Jugadores obtenidos exitosamente',
      data: jugadores,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
      await this.jugadoresService.remove(+id);
      return {
        status: 200,
        message: 'Jugador eliminado exitosamente',
      };
  }
  
  @Get(':id')
  async findOne(@Param('id') id: number) {
      const jugador = await this.jugadoresService.findOne(+id);
      return {
        status: 200,
        message: 'Jugador encontrado exitosamente',
        data: jugador,
      };
  }

  @Patch(':id')
  async update(
    @Param('id') id: number, 
    @Body() updateJugadorDto: UpdateJugadorDto
  ) {
    const jugadorActualizado = await this.jugadoresService.update(+id, updateJugadorDto);
    return {
      status: 200,
      message: 'Jugador actualizado exitosamente',
      data: jugadorActualizado,
      };    
  }

  
  //Devuelve las participaciones del jugador, en ellas esta la partida en la que participan
  @Get(':id/participaciones')
  async getParticipaciones(@Param('id') id: number) {
    const participaciones = await this.jugadoresService.getParticipaciones(id);
    console.log(participaciones);
    return {
      status: 200,
      message: 'Participaciones del jugador conseguidas exitosamente',
      data: participaciones,
     };
  }
  
  @Get('tokens/:id')
  async tokens(@Param('id') id: number) {
      const tokens = await this.jugadoresService.jugadores(id);
      return tokens;
  }


  //Subir la imagen
  @Post('subirImagen/:id')
  @UseInterceptors(
    FileInterceptor('imagen', {
      storage: diskStorage({
        destination: './assets/qr',
        filename: (req, file, cb) => {
          const uniqueName = `${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 15)}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      fileFilter: imageFileFilter, // Aplicar filtro para tipos de archivo
    }),
  )
  async uploadImage(
    @Param('id') id: number,
    @UploadedFile() file: Express.Multer.File,) {
      if (!file) {
        throw new BadRequestException('Solo se permiten archivos de imagen'); // Si el archivo es nulo, es porque fue rechazado por el filtro
      }  
      const jugador = await this.jugadoresService.findOne(id);
      if (!jugador) {
        throw new NotFoundException('Jugador no encontrado');
      }
      jugador.imagen = file.filename; // Asocia la imagen
      return await this.jugadoresService.updateJugador(jugador); // Actualiza en el servicio
  }


  @Get('imagen/:id')
  async obtenerImagen(@Param('id') id: number, @Req() req: Request ) {
    return await this.jugadoresService.obtenerImagen(id,req);   
  }
}

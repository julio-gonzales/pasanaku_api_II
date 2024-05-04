import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateJugadorDto } from './dto/create-jugador.dto';
import { UpdateJugadorDto } from './dto/update-jugador.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Request } from 'express';

import { Jugador } from './entities/jugador.entity';
import { CuentaService } from 'src/cuenta/cuenta.service';
import { Cuenta } from 'src/cuenta/entities/cuenta.entity';
import * as bcrypt from 'bcrypt';
import { LoginJugadorDto } from './dto/login-jugador.dto';
import { Invitacion } from 'src/invitacion/entities/invitacion.entity';

@Injectable()
export class JugadoresService {

  private readonly logger = new Logger('JugadoresService')

  constructor( 
    @InjectRepository( Jugador )private readonly jugadorRepository: Repository<Jugador>, 
    @InjectRepository( Cuenta )private readonly cuentaRepository: Repository<Cuenta>,
    @InjectRepository( Invitacion ) private readonly invitacionRepository: Repository<Invitacion>,  
    ) { }

  async create(createJugadorDto: CreateJugadorDto) {
    try {
      const { cuentas = [], password, tokenMovil, ...jugadorDetails } = createJugadorDto;

      const jugador = this.jugadorRepository.create({ 
        ...jugadorDetails,
        password: bcrypt.hashSync( password, 10 ),
        cuentas: cuentas.map( cuenta => this.cuentaRepository.create({ nro: cuenta.nro, departamento: cuenta.departamento }) ) 
      });

      if(tokenMovil != undefined && tokenMovil != null) {
        jugador.tokenMovil = tokenMovil;
        await this.jugadorRepository.save(jugador);
      }
      await this.jugadorRepository.save( jugador );
      delete jugador.password;

      //Asignar invitaciones
      const invitaciones = await this.invitacionRepository.find({
        where: {
            telefono: jugador.telefono,
            estado: 'Enviada'
        },
        relations: [],
        select: ['id', 'nombre', 'telefono', 'email', 'estado', 'partidaId'], 
      });

      
      if (invitaciones.length > 0) {
        for (const invitado of invitaciones) {
            invitado.jugador = jugador;
            await this.invitacionRepository.save(invitado);      
        }
      }
      return { ...jugador, cuentas };
      
    } catch (error) {      
      console.log(error);
      this.handleExceptions( error ); 
    }
  }


  findAll() {
    return this.jugadorRepository.find({
      relations: {
        cuentas: true,
      }
    });

  }


  async findOne( id: number ) {
    const jugador = await this.jugadorRepository.findOneBy({ id });
    if ( !jugador ) {
      throw new NotFoundException(`El jugador con el id ${ id } no fue encontrado.`)
    }
    return jugador;
  }

  async updateJugador( jugador: Jugador ) {
    return await this.jugadorRepository.save(jugador); 
  }

  async update( id: number, updateJugadorDto: UpdateJugadorDto ): Promise<Jugador> {
    // Busca al jugador existente por su ID
    const { cuentas, ...jugadorDto } = await this.jugadorRepository.findOneBy({ id });
    console.log(jugadorDto);
    
    if (!jugadorDto) {
      throw new NotFoundException(`Jugador con el id ${id} no encontrado`);
    }

    // Actualiza las propiedades del jugador según el DTO
    if ( updateJugadorDto.nombre ) {
      jugadorDto.nombre = updateJugadorDto.nombre;
    }
    if ( updateJugadorDto.telefono ) {
      jugadorDto.telefono =  updateJugadorDto.telefono;
    }
    if ( updateJugadorDto.email ) {
      jugadorDto.email =  updateJugadorDto.email;
    }
    if ( updateJugadorDto.ci ) {
      jugadorDto.ci =  updateJugadorDto.ci;
    }
    if ( updateJugadorDto.email ) {
      jugadorDto.email =  updateJugadorDto.email;
    }
    if ( updateJugadorDto.direccion ) {
      jugadorDto.direccion =  updateJugadorDto.direccion;
    }
    if ( updateJugadorDto.password ) {
      jugadorDto.password =  updateJugadorDto.password;
    }
    if ( updateJugadorDto.cuentas ) {
      await this.jugadorRepository.save({ cuentas, ...jugadorDto });
    } else {
      await this.jugadorRepository.save({ cuentas: [], ...jugadorDto });
    }

    // jugadorDto.cuentas = [];

    // Guarda el jugadorDto actualizado
    try {
      await this.jugadorRepository.save({ cuentas, ...jugadorDto });
      return await this.jugadorRepository.findOneBy({ id });
      
    } catch (error) {
      this.handleExceptions(error);
    }

  }

  async remove(id: number) {
    const jugador = await this.findOne(id);
    await this.jugadorRepository.remove( jugador );
  }

  async deleteAllJugadores() {
    const query = this.jugadorRepository.createQueryBuilder('jugador');

    try {
      return await query
      .delete()
      .where({})
      .execute();
    } catch ( error ) {
      this.handleExceptions(error)
      
    }
  }

  async login( loginJugadorDto: LoginJugadorDto ) {
    const { password, email } = loginJugadorDto;
    const jugador = await this.jugadorRepository.findOne({ 
      where: { email }, 
      select: { email: true, password: true, id :true, tokenMovil: true, nombre:true}
    });

    console.log('Este es el jugador encontrado', jugador);
    if ( !jugador) 
      throw new UnauthorizedException('Credenciales Incorrectas (correo)');
    if ( !bcrypt.compareSync( password, jugador.password ) )
      throw new UnauthorizedException('Credenciales Incorrectas (Contraseña)');

    if(loginJugadorDto.tokenMovil != undefined && loginJugadorDto.tokenMovil != null && jugador.tokenMovil != loginJugadorDto.tokenMovil) {
      jugador.tokenMovil = loginJugadorDto.tokenMovil;
      await this.jugadorRepository.save(jugador);
    } 

    delete jugador.cuentas;
    return jugador;
  }

  //Devuelve las participaciones del jugador, en ellas esta la partida en la que participan
  async getParticipaciones(id: number) {
    const jugador = await this.jugadorRepository.findOneBy({ id });
    const participaciones = jugador.participantesDeJugador;
    return participaciones;
  }

  private handleExceptions( error: any): never {
    if( error.code === '23505')
      throw new BadRequestException( error.detail );

    this.logger.error( error )

    throw new InternalServerErrorException('Error al conectar al servidor')
  }

  async jugadores(id: number) {
    const jugadores = await this.jugadorRepository.find({ 
      where: {
        participantesDeJugador: { partida: { id: id } },
      },
      select: ['id','tokenMovil'],
    });

    return jugadores;
  }

  async obtenerImagen(id: number,req: Request) : Promise<string>{
    const jugador = await this.findOne(id);
    if (!jugador) {
      throw new NotFoundException('Jugador no encontrado');
    }
    if (!jugador.imagen) {
      return null;
    }
    const protocol = req.protocol; // Protocolo utilizado (HTTP o HTTPS)
    const host = req.get('host'); // Nombre de dominio o dirección IP, junto con el puerto
    const imageUrl = `${protocol}://${host}/assets/qr/${jugador.imagen}`; // URL completa
    //const imageUrl: `/assets/qr/${jugador.imagen}`
    //const imagePath = join(__dirname, '..', '..', 'assets/qr', jugador.imagen);
    return imageUrl; // Devuelve la URL completa
  }

}

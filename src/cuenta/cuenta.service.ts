import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { DeleteResult, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateCuentaDto } from './dto/create-cuenta.dto';
import { UpdateCuentaDto } from './dto/update-cuenta.dto';

import { Cuenta } from './entities/cuenta.entity';
import { Jugador } from 'src/jugadores/entities/jugador.entity';
import { Banco } from 'src/banco/entities/banco.entity';


@Injectable()
export class CuentaService {


  private readonly logger = new Logger('CuentaService')

  constructor( 
    @InjectRepository( Cuenta ) private readonly cuentaRepository: Repository<Cuenta>, 
    @InjectRepository( Jugador ) private readonly jugadorRepository: Repository<Jugador>, 
    @InjectRepository( Banco ) private readonly bancoRepository: Repository<Banco>, 
  ) { }

  async create(createCuentaDto: CreateCuentaDto) {
    const { jugadorId, nro, departamento, bancoId } = createCuentaDto;

    try {
      // Obtener el jugador de la base de datos
      const jugador = await this.jugadorRepository.findOneBy({ id: jugadorId });
      if (!jugador) {
        throw new NotFoundException(`No se ha encontrado el jugador con el Id ${jugadorId}`);
      }

      // Obtener el banco de la base de datos
      const banco = await this.bancoRepository.findOneBy({ id: bancoId });
      if (!banco) {
        throw new NotFoundException(`No se ha encontrado el banco con el Id ${bancoId}`);
      }

      // Crear una nueva cuenta
      const nuevaCuenta = new Cuenta();
      nuevaCuenta.nro = nro;
      nuevaCuenta.departamento = departamento;

      // Asignar el banco a la nueva cuenta
      nuevaCuenta.banco = banco;

      // Guardar la nueva cuenta en la base de datos
      const cuentaGuardada = await this.cuentaRepository.save(nuevaCuenta);

      // Asociar la nueva cuenta al jugador
      jugador.cuentas.push(cuentaGuardada);

      // Guardar el jugador actualizado en la base de datos
      await this.jugadorRepository.save(jugador);

      return await this.jugadorRepository.findOneBy({ id: jugadorId}); // Devolver la cuenta guardada
    } catch (error) {
      console.log(error);
      this.handleExceptions(error);
    }
  }


  async findAll( id: number ) {
    try {
      // Buscar el jugador en la base de datos
      const jugador = await this.jugadorRepository.findOneBy({ id });
      if (!jugador) {
        throw new NotFoundException(`No se ha encontrado el jugador con el ID ${ id }`);
      }
      // Devolver las cuentas asociadas al jugador
      return jugador.cuentas;
    } catch (error) {
      console.log(error);
      this.handleExceptions(error);
    }
  }


  async findOne( id: number ) {
      // Buscar la cuenta en la base de datos
      const cuenta = await this.cuentaRepository.findOneBy({ id });
      console.log({ cuenta });
      
      if (!cuenta) {
        throw new NotFoundException(`No se ha encontrado la cuenta con el ID ${id}`);
      }
      return cuenta;
  }


  
  async update( id: number, updateCuentaDto: UpdateCuentaDto ) {
    try {
      const { nro, departamento } = updateCuentaDto;

      // Buscar la cuenta en la base de datos
      const cuenta = await this.cuentaRepository.findOneBy({ id });
      if (!cuenta) {
        throw new NotFoundException(`No se ha encontrado la cuenta con el ID ${id}`);
      }

      // Actualizar los datos de la cuenta
      cuenta.nro = nro;
      cuenta.departamento = departamento;

      // Guardar la cuenta actualizada en la base de datos
      await this.cuentaRepository.save(cuenta);

      return { mensaje: `La cuenta con el ID ${ id } ha sido actualizada` };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }



  async deleteCuentaFromJugador(jugadorId: number, cuentaId: number) {
    try {
      // Buscar el jugador en la base de datos
      const jugador = await this.jugadorRepository.findOneBy({ id: jugadorId });
      const cuentaDel = await this.cuentaRepository.findOneBy({ id: cuentaId });
      if (!jugador) {
        throw new NotFoundException(`No se ha encontrado el jugador con el ID ${jugadorId}`);
      }

      // Buscar la cuenta específica en las cuentas asociadas al jugador
      console.log(jugador.cuentas);
      const cuenta = jugador.cuentas.find(c => c.id == cuentaId);
      if (!cuenta) {
        throw new NotFoundException(`No se ha encontrado la cuenta con el ID ${cuentaId} asociada al jugador con el ID ${jugadorId}`);
      }

      // Eliminar la cuenta de la base de datos
      await this.cuentaRepository.remove(cuentaDel);

      // Eliminar la cuenta de la lista de cuentas del jugador
      jugador.cuentas = jugador.cuentas.filter(c => c.id != cuentaId);

      // Guardar el jugador actualizado en la base de datos
      await this.jugadorRepository.save(jugador);

      return { mensaje: `La cuenta con el ID ${cuentaId} ha sido eliminada del jugador con el ID ${jugadorId}` };
    } catch (error) {
      console.log(error);
      throw error;
    }
}


  

  private handleExceptions( error: any ) {
    if( error.code === '23505')
      throw new BadRequestException( error.detail );

    this.logger.error( error )

    throw new InternalServerErrorException('Error al conectar al servidor')
  }
}

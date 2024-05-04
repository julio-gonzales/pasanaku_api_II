import { Injectable, Logger, NotFoundException,BadRequestException, InternalServerErrorException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateMonedaDto } from './dto/create-moneda.dto';
import { UpdateMonedaDto } from './dto/update-moneda.dto';
import { Moneda } from './entities/moneda.entity';

@Injectable()
export class MonedaService {

    private readonly logger = new Logger('BancoService')

  constructor( @InjectRepository( Moneda ) private readonly monedaRepository: Repository<Moneda>, ) { }

  async create(createMonedaDto: CreateMonedaDto) {
    try {
      const moneda = this.monedaRepository.create( createMonedaDto);
      await this.monedaRepository.save( moneda );

      return moneda;

    } catch (error) {      
      console.log(error);
      this.handleExceptions( error ); 
    }
  }

  findAll() {
    return this.monedaRepository.find({});
  }

  async findOne(id: number) {
    const moneda = await this.monedaRepository.findOneBy({ id });
    if ( !moneda ) {
      throw new NotFoundException(`La moneda con el id ${ id } no fue encontrado.`)
    }
    return moneda;
  }

  async update(id: number, updateMonedaDto: UpdateMonedaDto) {
    const moneda = await this.monedaRepository.findOneBy({ id });

    console.log(moneda);
    
    if (!moneda) {
      throw new NotFoundException(`La moneda con el id ${id} no encontrado`);
    }

    // Actualiza las propiedades del banco según el DTO
    if (updateMonedaDto.nombre) {
      moneda.nombre = updateMonedaDto.nombre;
    }
    
    // Guarda el banco actualizado
    await this.monedaRepository.save(moneda);

    return moneda;
  }


  async remove(id: number) {
    const moneda = await this.findOne(id);
    await this.monedaRepository.remove( moneda );
  }


  private handleExceptions( error: any ) {
    if( error.code === '23505')
      throw new BadRequestException( error.detail );

    this.logger.error( error )

    throw new InternalServerErrorException('Error al conectar al servidor')
  }
}

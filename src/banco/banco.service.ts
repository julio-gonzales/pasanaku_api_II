import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateBancoDto } from './dto/create-banco.dto';
import { UpdateBancoDto } from './dto/update-banco.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Banco } from './entities/banco.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BancoService {


  private readonly logger = new Logger('BancoService')

  constructor( @InjectRepository( Banco ) private readonly bancoRepository: Repository<Banco>, ) { }

  async create(createBancoDto: CreateBancoDto) {
    try {
      const banco = this.bancoRepository.create( createBancoDto );
      await this.bancoRepository.save( banco );

      return banco;

    } catch (error) {      
      console.log(error);
      this.handleExceptions( error ); 
    }
  }

  findAll() {
    return this.bancoRepository.find({});
  }

  async findOne(id: number) {
    const banco = await this.bancoRepository.findOneBy({ id });
    if ( !banco ) {
      throw new NotFoundException(`El banco con el id ${ id } no fue encontrado.`)
    }
    return banco;
  }

  async update(id: number, updateBancoDto: UpdateBancoDto) {
    const banco = await this.bancoRepository.findOneBy({ id });

    console.log(banco);
    
    if (!banco) {
      throw new NotFoundException(`Banco con el id ${id} no encontrado`);
    }

    // Actualiza las propiedades del banco según el DTO
    if (updateBancoDto.nombre) {
      banco.nombre = updateBancoDto.nombre;
    }
    
    // Guarda el banco actualizado
    await this.bancoRepository.save(banco);

    return banco;
  }

  async remove(id: number) {
    const banco = await this.findOne(id);
    await this.bancoRepository.remove( banco );
  }


  private handleExceptions( error: any ) {
    if( error.code === '23505')
      throw new BadRequestException( error.detail );

    this.logger.error( error )

    throw new InternalServerErrorException('Error al conectar al servidor')
  }
}

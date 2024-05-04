import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RolesService {
  
  private readonly logger = new Logger('RoleService')

  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ){}

  async create(createRoleDto: CreateRoleDto) {
    try {
      const role = this.roleRepository.create(createRoleDto);
      await this.roleRepository.save(role);
      return role;
    } catch (error) {
      console.log(error)
      if (error.code === '23505') {
        throw new BadRequestException(error.detail);
      }
      this.logger.error(error);
      throw new InternalServerErrorException('Fallo en la creacion')
    }
  }

  findAll() {
    return  this.roleRepository.find({});;
  }

  findOne(id: number) {
    return `This action returns a #${id} role`;
  }

  update(id: number, updateRoleDto: UpdateRoleDto) {
    return `This action updates a #${id} role`;
  }

  remove(id: number) {
    return `This action removes a #${id} role`;
  }
}

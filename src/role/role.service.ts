import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Unique_Error_Code } from 'src/common/constants';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  async create(createRoleDto: CreateRoleDto) {
    try {
      const newRole = await this.prisma.role.create({
        data: {
          name: createRoleDto.name,
        },
      });

      return newRole;
    } catch (error) {
      if (error.code === Unique_Error_Code) {
        throw new BadRequestException('Role name has already exists');
      }

      throw new InternalServerErrorException(
        'Role creationg failed. Please try again later.',
      );
    }
  }

  async findAll() {
    return await this.prisma.role.findMany();
  }

  async findOne(id: number) {
    const result = await this.prisma.role.findUnique({
      where: { id },
    });
    if (!result) {
      throw new NotFoundException('Role not found');
    }
    return result;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    try {
      const existingRole = await this.prisma.role.findUnique({
        where: { id },
      });
      if (!existingRole) {
        throw new NotFoundException('Role not found');
      }

      const updatedRole = await this.prisma.role.update({
        where: { id },
        data: {
          name: updateRoleDto.name,
        },
      });

      return updatedRole;
    } catch (error) {
      if (error.code === Unique_Error_Code) {
        throw new BadRequestException('Role name has already exists');
      }

      throw new InternalServerErrorException(
        'Role creationg failed. Please try again later.',
      );
    }
  }

  async remove(id: number) {
    const existingRole = await this.prisma.role.findUnique({
      where: { id },
    });
    if (!existingRole) {
      throw new NotFoundException('Role not found');
    }

    await this.prisma.role.delete({
      where: { id },
    });
  }
}

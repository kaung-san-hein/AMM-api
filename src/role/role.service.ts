import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PrismaService } from 'src/prisma/prisma.service';

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
      if (error.code === 'P2002') {
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

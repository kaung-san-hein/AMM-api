import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  async create(createRoleDto: CreateRoleDto) {
    const newRole = await this.prisma.role.create({
      data: {
        name: createRoleDto.name,
      },
    });

    return newRole;
  }

  async findAll() {
    return await this.prisma.role.findMany();
  }

  async findOne(id: number) {
    return await this.prisma.role.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    const existingRole = await this.prisma.role.findUnique({
      where: { id },
    });
    if (!existingRole) {
      throw new Error('Role not found');
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
      throw new Error('Role not found');
    }

    await this.prisma.role.delete({
      where: { id },
    });
  }
}

import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Unique_Error_Code } from 'src/common/constants';

@Injectable()
export class SupplierService {
  constructor(private prisma: PrismaService) {}

  async create(createSupplierDto: CreateSupplierDto) {
    try {
      const newSupplier = await this.prisma.supplier.create({
        data: createSupplierDto,
      });

      return newSupplier;
    } catch (error) {
      if (error.code === Unique_Error_Code) {
        throw new BadRequestException('Supplier phone no has already exists');
      }

      throw new InternalServerErrorException(
        'Supplier creationg failed. Please try again later.',
      );
    }
  }

  async findAll(page: number, limit: number) {
    const offset = (page - 1) * limit;

    if (!limit) {
      const suppliers = await this.prisma.supplier.findMany();
      return { suppliers };
    }

    const [total, suppliers] = await this.prisma.$transaction([
      this.prisma.supplier.count(),
      this.prisma.supplier.findMany({
        skip: offset,
        take: limit,
      }),
    ]);

    return {
      total,
      suppliers,
    };
  }

  async findOne(id: number) {
    const result = await this.prisma.supplier.findUnique({
      where: { id },
    });
    if (!result) {
      throw new NotFoundException('Supplier not found');
    }
    return result;
  }

  async update(id: number, updateSupplierDto: UpdateSupplierDto) {
    try {
      const existingSupplier = await this.prisma.supplier.findUnique({
        where: { id },
      });
      if (!existingSupplier) {
        throw new NotFoundException('Supplier not found');
      }

      const updatedSupplier = await this.prisma.supplier.update({
        where: { id },
        data: updateSupplierDto,
      });

      return updatedSupplier;
    } catch (error) {
      if (error.code === Unique_Error_Code) {
        throw new BadRequestException('Supplier phone no has already exists');
      }

      throw new InternalServerErrorException(
        'Supplier updating failed. Please try again later.',
      );
    }
  }

  async remove(id: number) {
    const existingSupplier = await this.prisma.supplier.findUnique({
      where: { id },
    });
    if (!existingSupplier) {
      throw new NotFoundException('Supplier not found');
    }

    await this.prisma.supplier.delete({
      where: { id },
    });
  }
}

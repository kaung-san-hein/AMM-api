import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Unique_Error_Code } from 'src/common/constants';

@Injectable()
export class CustomerService {
  constructor(private prisma: PrismaService) {}

  async create(createCustomerDto: CreateCustomerDto) {
    try {
      const newCustomer = await this.prisma.customer.create({
        data: createCustomerDto,
      });

      return newCustomer;
    } catch (error) {
      if (error.code === Unique_Error_Code) {
        throw new BadRequestException('Customer phone no has already exists');
      }

      throw new InternalServerErrorException(
        'Customer creationg failed. Please try again later.',
      );
    }
  }

  async findAll(page: number, limit: number) {
    const offset = (page - 1) * limit;

    const [total, customers] = await this.prisma.$transaction([
      this.prisma.customer.count(),
      this.prisma.customer.findMany({
        skip: offset,
        take: limit,
      }),
    ]);

    return {
      total,
      customers,
    };
  }

  async findOne(id: number) {
    const result = await this.prisma.customer.findUnique({
      where: { id },
    });
    if (!result) {
      throw new NotFoundException('Customer not found');
    }
    return result;
  }

  async update(id: number, updateCustomerDto: UpdateCustomerDto) {
    try {
      const existingCustomer = await this.prisma.customer.findUnique({
        where: { id },
      });
      if (!existingCustomer) {
        throw new NotFoundException('Customer not found');
      }

      const updatedCustomer = await this.prisma.customer.update({
        where: { id },
        data: updateCustomerDto,
      });

      return updatedCustomer;
    } catch (error) {
      if (error.code === Unique_Error_Code) {
        throw new BadRequestException('Customer phone no has already exists');
      }

      throw new InternalServerErrorException(
        'Customer updating failed. Please try again later.',
      );
    }
  }

  async remove(id: number) {
    const existingCustomer = await this.prisma.customer.findUnique({
      where: { id },
    });
    if (!existingCustomer) {
      throw new NotFoundException('Customer not found');
    }

    await this.prisma.customer.delete({
      where: { id },
    });
  }
}

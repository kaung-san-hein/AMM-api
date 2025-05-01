import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const newProduct = await this.prisma.product.create({
        data: createProductDto,
        include: {
          category: true,
        },
      });

      return newProduct;
    } catch (error) {
      throw new InternalServerErrorException(
        'Product creating failed. Please try again later.',
      );
    }
  }

  async findAll(page: number, limit: number) {
    const offset = (page - 1) * limit;

    const [total, products] = await this.prisma.$transaction([
      this.prisma.product.count(),
      this.prisma.product.findMany({
        skip: offset,
        take: limit,
        include: {
          category: true,
        },
      }),
    ]);

    return {
      total,
      products,
    };
  }

  async findOne(id: number) {
    const result = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!result) {
      throw new NotFoundException('Product not found');
    }
    return result;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });

    return updatedProduct;
  }

  async remove(id: number) {
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    await this.prisma.product.delete({
      where: { id },
    });
  }
}

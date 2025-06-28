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

  async findAll(
    page: number,
    limit: number,
    maxStock?: number,
    search?: string,
  ) {
    const offset = (page - 1) * limit;

    const andConditions: any[] = [];

    if (maxStock !== undefined) {
      andConditions.push({ stock: { lt: maxStock } });
    }

    if (search) {
      const searchTerms = search.split(' ').filter((term) => term.length > 0);

      const searchOrConditions: any[] = [];

      searchTerms.forEach((term) => {
        const searchCondition = {
          mode: 'insensitive',
          contains: term,
        };
        searchOrConditions.push(
          { size: searchCondition },
          { category: { name: searchCondition } },
        );
      });

      if (searchOrConditions.length > 0) {
        andConditions.push({ OR: searchOrConditions });
      }
    }

    let where: any = undefined;
    if (andConditions.length > 0) {
      where = { AND: andConditions };
    }

    if (!limit) {
      const products = await this.prisma.product.findMany({
        where,
        include: { category: true },
      });
      return { products };
    }

    const [total, products] = await this.prisma.$transaction([
      this.prisma.product.count({
        where,
      }),
      this.prisma.product.findMany({
        skip: offset,
        take: limit,
        where,
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
      include: {
        category: true,
      },
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
      include: { category: true },
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

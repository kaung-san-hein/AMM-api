import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    try {
      const newCategory = await this.prisma.category.create({
        data: {
          name: createCategoryDto.name,
        },
      });

      return newCategory;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Category name has already exists');
      }

      throw new InternalServerErrorException(
        'Category creationg failed. Please try again later.',
      );
    }
  }

  async findAll() {
    return await this.prisma.category.findMany();
  }

  async findOne(id: number) {
    const result = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!result) {
      throw new NotFoundException('Category not found');
    }
    return result;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    try {
      const existingCategory = await this.prisma.category.findUnique({
        where: { id },
      });
      if (!existingCategory) {
        throw new NotFoundException('Category not found');
      }

      const updatedCategory = await this.prisma.category.update({
        where: { id },
        data: {
          name: updateCategoryDto.name,
        },
      });

      return updatedCategory;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Category name has already exists');
      }

      throw new InternalServerErrorException(
        'Category creationg failed. Please try again later.',
      );
    }
  }

  async remove(id: number) {
    const existingCategory = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!existingCategory) {
      throw new NotFoundException('Category not found');
    }

    await this.prisma.category.delete({
      where: { id },
    });
  }
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCustomerInvoiceDto } from './dto/create-customer_invoice.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CustomerInvoiceService {
  constructor(private prisma: PrismaService) {}

  async create(createCustomerInvoiceDto: CreateCustomerInvoiceDto) {
    const { customer_id, date, total, items } = createCustomerInvoiceDto;

    return await this.prisma.$transaction(async (prisma) => {
      // Step 1: Get current stock for all involved products
      const productIds = items.map((item) => item.product_id);

      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, stock: true },
      });

      // Step 2: Check stock availability
      const stockMap = new Map(products.map((p) => [p.id, p.stock]));

      for (const item of items) {
        const available = stockMap.get(item.product_id);
        if (available === undefined) {
          throw new BadRequestException(`Product ${item.product_id} not found`);
        }
        if (available < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for product ${item.product_id}: available ${available}, requested ${item.quantity}`,
          );
        }
      }

      // Step 3: Create invoice with items
      const newInvoice = await prisma.customerInvoice.create({
        data: {
          customer_id,
          date,
          total,
          customer_invoice_items: {
            create: items.map((item) => ({
              product_id: item.product_id,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          customer_invoice_items: true,
          customer: true,
        },
      });

      // Step 4: Bulk update product stocks using `updateMany`
      const updatePromises = items.map((item) =>
        prisma.product.update({
          where: { id: item.product_id },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        }),
      );

      // Execute all updates in parallel
      await Promise.all(updatePromises);

      return newInvoice;
    });
  }

  async findAll(page: number, limit: number) {
    const offset = (page - 1) * limit;

    const [total, customer_invoices] = await this.prisma.$transaction([
      this.prisma.customerInvoice.count(),
      this.prisma.customerInvoice.findMany({
        skip: offset,
        take: limit,
        include: {
          customer_invoice_items: true,
          customer: true,
        },
      }),
    ]);

    return {
      total,
      customer_invoices,
    };
  }

  async findOne(id: number) {
    const result = await this.prisma.customerInvoice.findUnique({
      where: { id },
      include: {
        customer_invoice_items: true,
        customer: true,
      },
    });
    if (!result) {
      throw new NotFoundException('Invoice not found');
    }
    return result;
  }

  async remove(id: number) {
    const existingInvoice = await this.prisma.customerInvoice.findUnique({
      where: { id },
    });
    if (!existingInvoice) {
      throw new NotFoundException('Invoice not found');
    }

    await this.prisma.customerInvoice.delete({
      where: { id },
    });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSupplierInvoiceDto } from './dto/create-supplier_invoice.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SupplierInvoiceService {
  constructor(private prisma: PrismaService) {}

  async create(createSupplierInvoiceDto: CreateSupplierInvoiceDto) {
    const { supplier_id, date, total, items } = createSupplierInvoiceDto;

    return await this.prisma.$transaction(async (prisma) => {
      // Step 1: Create invoice with items
      const newInvoice = await prisma.supplierInvoice.create({
        data: {
          supplier_id,
          date,
          total,
          supplier_invoice_items: {
            create: items.map((item) => ({
              product_id: item.product_id,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          supplier_invoice_items: true,
          supplier: true,
        },
      });

      // Step 2: Bulk update product stocks using `updateMany`
      const updatePromises = items.map((item) =>
        prisma.product.update({
          where: { id: item.product_id },
          data: {
            stock: {
              increment: item.quantity,
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

    const [total, supplier_invoices] = await this.prisma.$transaction([
      this.prisma.supplierInvoice.count(),
      this.prisma.supplierInvoice.findMany({
        skip: offset,
        take: limit,
        include: {
          supplier_invoice_items: true,
          supplier: true,
        },
      }),
    ]);

    return {
      total,
      supplier_invoices,
    };
  }

  async findOne(id: number) {
    const result = await this.prisma.supplierInvoice.findUnique({
      where: { id },
      include: {
        supplier_invoice_items: true,
        supplier: true,
      },
    });
    if (!result) {
      throw new NotFoundException('Invoice not found');
    }
    return result;
  }

  async remove(id: number) {
    const existingInvoice = await this.prisma.supplierInvoice.findUnique({
      where: { id },
    });
    if (!existingInvoice) {
      throw new NotFoundException('Invoice not found');
    }

    await this.prisma.supplierInvoice.delete({
      where: { id },
    });
  }
}

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
        orderBy: {
          id: 'desc',
        },
        include: {
          supplier_invoice_items: {
            include: {
              product: {
                include: {
                  category: true,
                },
              },
            },
          },
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
        supplier_invoice_items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
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

  async getReport() {
    // Get current year for yearly data
    const currentYear = new Date().getFullYear();
    
    // Get monthly purchases for current year
    const monthlyPurchases = await this.prisma.supplierInvoice.groupBy({
      by: ['date'],
      where: {
        date: {
          gte: new Date(currentYear, 0, 1), // January 1st of current year
          lte: new Date(currentYear, 11, 31), // December 31st of current year
        },
      },
      _sum: {
        total: true,
      },
    });

    // Get yearly purchases for last 5 years
    const yearlyPurchases = await this.prisma.supplierInvoice.groupBy({
      by: ['date'],
      where: {
        date: {
          gte: new Date(currentYear - 4, 0, 1), // 5 years ago
          lte: new Date(currentYear, 11, 31), // Current year end
        },
      },
      _sum: {
        total: true,
      },
    });

    // Process monthly data
    const monthlyData = new Array(12).fill(0);
    monthlyPurchases.forEach((purchase) => {
      const month = new Date(purchase.date).getMonth();
      monthlyData[month] += purchase._sum.total || 0;
    });

    // Process yearly data
    const yearlyData = new Map<number, number>();
    yearlyPurchases.forEach((purchase) => {
      const year = new Date(purchase.date).getFullYear();
      const existing = yearlyData.get(year) || 0;
      yearlyData.set(year, existing + (purchase._sum.total || 0));
    });

    // Convert yearly data to sorted array
    const yearlyDataArray = Array.from(yearlyData.entries())
      .sort(([a], [b]) => a - b)
      .map(([year, total]) => ({ year, total }));

    return {
      monthly: {
        labels: [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ],
        data: monthlyData,
      },
      yearly: {
        labels: yearlyDataArray.map(item => item.year.toString()),
        data: yearlyDataArray.map(item => item.total),
      },
    };
  }
}

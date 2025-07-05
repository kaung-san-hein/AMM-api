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
        orderBy: {
          id: 'desc',
        },
        include: {
          customer_invoice_items: {
            include: {
              product: true,
            },
          },
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

  async mostSaleProducts() {
    const topSalesByCategory = await this.prisma.customerInvoiceItem.groupBy({
      by: ['product_id'],
      where: {
        product_id: {
          not: null,
        },
      },
      _sum: {
        quantity: true,
      },
    });

    const productIds = topSalesByCategory.map((item) => item.product_id!);
    
    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
      include: {
        category: true,
      },
    });

    const categorySales = new Map<number, { category: any; totalSold: number }>();
    
    topSalesByCategory.forEach((item) => {
      const product = products.find((p) => p.id === item.product_id);
      if (product && product.category) {
        const categoryId = product.category.id;
        const existing = categorySales.get(categoryId);
        
        if (existing) {
          existing.totalSold += item._sum.quantity || 0;
        } else {
          categorySales.set(categoryId, {
            category: product.category,
            totalSold: item._sum.quantity || 0,
          });
        }
      }
    });

    const result = Array.from(categorySales.values()).sort((a, b) => b.totalSold - a.totalSold);

    return result.slice(0, 7);
  }

  async getReport() {
    // Get current year for yearly data
    const currentYear = new Date().getFullYear();
    
    // Get monthly sales for current year
    const monthlySales = await this.prisma.customerInvoice.groupBy({
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

    // Get yearly sales for last 5 years
    const yearlySales = await this.prisma.customerInvoice.groupBy({
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
    monthlySales.forEach((sale) => {
      const month = new Date(sale.date).getMonth();
      monthlyData[month] += sale._sum.total || 0;
    });

    // Process yearly data
    const yearlyData = new Map<number, number>();
    yearlySales.forEach((sale) => {
      const year = new Date(sale.date).getFullYear();
      const existing = yearlyData.get(year) || 0;
      yearlyData.set(year, existing + (sale._sum.total || 0));
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

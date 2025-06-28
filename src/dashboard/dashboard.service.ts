import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getAllTotal() {
    const [customerInvoiceTotal, supplierInvoiceTotal, stockAlert] =
      await Promise.all([
        this.prisma.customerInvoice.aggregate({
          _sum: {
            total: true,
          },
        }),
        this.prisma.supplierInvoice.aggregate({
          _sum: {
            total: true,
          },
        }),
        this.prisma.product.aggregate({
          _count: {
            id: true,
          },
          where: { stock: { lt: 100 } },
        }),
      ]);

    return {
      customerInvoiceTotal: customerInvoiceTotal._sum.total || 0,
      supplierInvoiceTotal: supplierInvoiceTotal._sum.total || 0,
      stockAlert: stockAlert._count.id || 0,
    };
  }
}

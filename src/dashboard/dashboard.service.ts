import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getAllTotal() {
    const [customerInvoiceTotal, supplierInvoiceTotal] = await Promise.all([
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
    ]);

    return {
      customerInvoiceTotal: customerInvoiceTotal._sum.total || 0,
      supplierInvoiceTotal: supplierInvoiceTotal._sum.total || 0,
    };
  }
}

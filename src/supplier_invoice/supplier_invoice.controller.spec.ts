import { Test, TestingModule } from '@nestjs/testing';
import { SupplierInvoiceController } from './supplier_invoice.controller';
import { SupplierInvoiceService } from './supplier_invoice.service';

describe('SupplierInvoiceController', () => {
  let controller: SupplierInvoiceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SupplierInvoiceController],
      providers: [SupplierInvoiceService],
    }).compile();

    controller = module.get<SupplierInvoiceController>(SupplierInvoiceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

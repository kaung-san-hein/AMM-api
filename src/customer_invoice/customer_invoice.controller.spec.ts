import { Test, TestingModule } from '@nestjs/testing';
import { CustomerInvoiceController } from './customer_invoice.controller';
import { CustomerInvoiceService } from './customer_invoice.service';

describe('CustomerInvoiceController', () => {
  let controller: CustomerInvoiceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerInvoiceController],
      providers: [CustomerInvoiceService],
    }).compile();

    controller = module.get<CustomerInvoiceController>(CustomerInvoiceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

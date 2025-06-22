import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
  HttpCode,
  Query,
} from '@nestjs/common';
import { CustomerInvoiceService } from './customer_invoice.service';
import { CreateCustomerInvoiceDto } from './dto/create-customer_invoice.dto';
import { RoleName } from 'src/role/dto';
import { AuthorizeGuard } from 'src/common/guards/authorization.guard';

@Controller('customer-invoices')
@UseGuards(AuthorizeGuard(RoleName.ADMIN))
export class CustomerInvoiceController {
  constructor(
    private readonly customerInvoiceService: CustomerInvoiceService,
  ) {}

  @Get('/most-sale-products')
  getMostSaleProducts() {
    return this.customerInvoiceService.mostSaleProducts();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCustomerInvoiceDto: CreateCustomerInvoiceDto) {
    return this.customerInvoiceService.create(createCustomerInvoiceDto);
  }

  @Get()
  findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '5',
  ) {
    return this.customerInvoiceService.findAll(+page, +limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customerInvoiceService.findOne(+id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.customerInvoiceService.remove(+id);
  }
}

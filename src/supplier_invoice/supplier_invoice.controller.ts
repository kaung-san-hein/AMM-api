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
  Patch,
} from '@nestjs/common';
import { SupplierInvoiceService } from './supplier_invoice.service';
import { CreateSupplierInvoiceDto } from './dto/create-supplier_invoice.dto';
import { UpdateSupplierInvoiceDto } from './dto/update-supplier_invoice.dto';
import { AuthorizeGuard } from 'src/common/guards/authorization.guard';
import { RoleName } from 'src/role/dto';

@Controller('supplier-invoices')
@UseGuards(AuthorizeGuard(RoleName.ADMIN))
export class SupplierInvoiceController {
  constructor(
    private readonly supplierInvoiceService: SupplierInvoiceService,
  ) {}

  @Get('/report')
  @HttpCode(HttpStatus.OK)
  getReport() {
    return this.supplierInvoiceService.getReport();
  }

  @Get('/orders')
  @HttpCode(HttpStatus.OK)
  getOrders(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '5',
  ) {
    return this.supplierInvoiceService.getOrders(+page, +limit);
  }

  @Get('/export')
  @HttpCode(HttpStatus.OK)
  getExport() {
    return this.supplierInvoiceService.findAllForExport();
  }

  @Patch('/orders/:id')
  @HttpCode(HttpStatus.CREATED)
  updateOrder(@Param('id') id: string, @Body() updateSupplierInvoiceDto: UpdateSupplierInvoiceDto) {
    return this.supplierInvoiceService.updateOrder(+id, updateSupplierInvoiceDto);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createSupplierInvoiceDto: CreateSupplierInvoiceDto) {
    return this.supplierInvoiceService.create(createSupplierInvoiceDto);
  }

  @Get()
  findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '5',
  ) {
    return this.supplierInvoiceService.findAll(+page, +limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.supplierInvoiceService.findOne(+id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.supplierInvoiceService.remove(+id);
  }
}

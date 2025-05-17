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
import { SupplierInvoiceService } from './supplier_invoice.service';
import { CreateSupplierInvoiceDto } from './dto/create-supplier_invoice.dto';
import { AuthorizeGuard } from 'src/common/guards/authorization.guard';
import { RoleName } from 'src/role/dto';

@Controller('supplier-invoices')
@UseGuards(AuthorizeGuard(RoleName.ADMIN))
export class SupplierInvoiceController {
  constructor(
    private readonly supplierInvoiceService: SupplierInvoiceService,
  ) {}

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

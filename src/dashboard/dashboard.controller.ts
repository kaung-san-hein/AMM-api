import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthorizeGuard } from 'src/common/guards/authorization.guard';
import { RoleName } from 'src/role/dto';

@Controller('dashboard')
@UseGuards(AuthorizeGuard(RoleName.ADMIN))
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}
  @Get('total')
  getAllTotal() {
    return this.dashboardService.getAllTotal();
  }
}

import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto, SignupDto } from './dto';
import { Tokens } from './types';
import { RefreshTokenGuard } from 'src/common/guards';
import {
  GetCurrentUser,
  GetCurrentUserId,
  Public,
} from 'src/common/decorators';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  signupLocal(@Body() data: SignupDto): Promise<Tokens> {
    return this.authService.signupLocal(data);
  }

  @Public()
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  signinLocal(@Body() data: AuthDto): Promise<Tokens> {
    return this.authService.signinLocal(data);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@GetCurrentUserId() userId: number) {
    return this.authService.logout(userId);
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  getUser(@GetCurrentUserId() userId: number) {
    return this.authService.me(userId);
  }

  @Public()
  @Post('refresh')
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  refreshTokens(
    @GetCurrentUserId() userId: number,
    @GetCurrentUser('refreshToken') refreshToken: string,
  ) {
    return this.authService.refreshTokens(userId, refreshToken);
  }
}

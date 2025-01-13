import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as bcrypt from 'bcrypt';
import { Tokens } from './types';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signupLocal(data: AuthDto): Promise<Tokens> {
    const hashPassword = await this.hashData(data.password);

    const newUser = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashPassword,
      },
    });

    const tokens = await this.getToken(newUser.id, newUser.email);

    await this.updateRefreshToken(newUser.id, tokens.refresh_token);

    return tokens;
  }

  async signinLocal(data: AuthDto): Promise<Tokens> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (!user) throw new ForbiddenException('Access Denied');

    const passwordMatch = await bcrypt.compare(data.password, user.password);

    if (!passwordMatch) throw new ForbiddenException('Access Denied');

    const tokens = await this.getToken(user.id, user.email);

    await this.updateRefreshToken(user.id, tokens.refresh_token);

    return tokens;
  }

  async logout(userId: number) {
    await this.prisma.user.update({
      where: {
        id: userId,
        refreshToken: {
          not: null,
        },
      },
      data: {
        refreshToken: null,
      },
    });
  }

  async refreshTokens(userId: number, refreshToken: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user || !user.refreshToken) throw new ForbiddenException('Access Denied');

    const refreshTokenMatch = await bcrypt.compare(refreshToken, user.refreshToken);

    if (!refreshTokenMatch) throw new ForbiddenException('Access Denied');

    const tokens = await this.getToken(user.id, user.email);

    await this.updateRefreshToken(user.id, tokens.refresh_token);

    return tokens;
  }

  async hashData(data: string) {
    return await bcrypt.hash(data, 10);
  }

  async getToken(userId: number, email: string): Promise<Tokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: 'access_token_secret',
          expiresIn: 60 * 15,
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: 'refresh-token-secret',
          expiresIn: 60 * 60 * 24 * 7,
        },
      ),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    const hashRefreshToken = await this.hashData(refreshToken);

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshToken: hashRefreshToken,
      },
    });
  }
}

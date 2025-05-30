import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto, SignupDto } from './dto';
import * as bcrypt from 'bcrypt';
import { Tokens } from './types';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async signupLocal(data: SignupDto): Promise<Tokens> {
    try {
      const hashPassword = await this.hashData(data.password);

      const newUser = await this.prisma.user.create({
        data: {
          name: data.name,
          phone_no: data.phone_no,
          password: hashPassword,
        },
      });

      const tokens = await this.getToken(newUser.id);

      await this.updateRefreshToken(newUser.id, tokens.refresh_token);

      return tokens;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Phone number already exists');
      }

      throw new InternalServerErrorException(
        'Signup failed. Please try again later.',
      );
    }
  }

  async signinLocal(data: AuthDto): Promise<Tokens> {
    const user = await this.prisma.user.findUnique({
      where: {
        phone_no: data.phone_no,
      },
    });

    if (!user) throw new ForbiddenException('Access Denied');

    const passwordMatch = await bcrypt.compare(data.password, user.password);

    if (!passwordMatch) throw new ForbiddenException('Access Denied');

    const tokens = await this.getToken(user.id);

    await this.updateRefreshToken(user.id, tokens.refresh_token);

    const response = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      name: user.name,
      phone_no: user.phone_no,
    };

    return response;
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

    if (!user || !user.refreshToken)
      throw new ForbiddenException('Access Denied');

    const refreshTokenMatch = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );

    if (!refreshTokenMatch) throw new ForbiddenException('Access Denied');

    const tokens = await this.getToken(user.id);

    await this.updateRefreshToken(user.id, tokens.refresh_token);

    return tokens;
  }

  async findOne(id: number) {
    const result = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
    if (!result) {
      throw new NotFoundException('User not found');
    }
    return result;
  }

  async me(id: number) {
    const result = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
    if (!result) {
      throw new NotFoundException('User not found');
    }
    return result;
  }

  async verifyToken(token: string) {
    const secret = this.config.get<string>('ACCESS_TOKEN_SECRET');

    const result = await this.jwtService.verify(token, { secret });

    return result;
  }

  async hashData(data: string) {
    return await bcrypt.hash(data, 10);
  }

  async getToken(userId: number): Promise<Tokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
        },
        {
          secret: this.config.get<string>('ACCESS_TOKEN_SECRET'),
          expiresIn: 60 * 60 * 24 * 7,
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
        },
        {
          secret: this.config.get<string>('REFRESH_TOKEN_SECRET'),
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

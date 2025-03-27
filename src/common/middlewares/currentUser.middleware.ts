import { Injectable, NestMiddleware } from '@nestjs/common';
import { isArray } from 'class-validator';
import { NextFunction, Request, Response } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { User as UserType } from 'src/auth/types';

declare global {
  namespace Express {
    interface Request {
      currentUser?: UserType;
    }
  }
}

interface JwtPayload {
  sub: string;
}

@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (
      !authHeader ||
      isArray(authHeader) ||
      !authHeader.startsWith('Bearer ')
    ) {
      req.currentUser = null;
    } else {
      try {
        const token = authHeader.split(' ')[1];
        const { sub } = <JwtPayload>await this.authService.verifyToken(token);

        const currentUser = await this.authService.findOne(+sub);
        req.currentUser = currentUser;
      } catch (err) {
        req.currentUser = null;
      }
    }

    next();
  }
}

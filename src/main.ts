import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import {
  CustomErrorInterceptor,
  SuccessResponseInterceptor,
} from './common/Interceptors';
import { validationErrorMessage } from './common/constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors) => {
        const formattedErrors = errors.map((error) => ({
          field: error.property,
          message: Object.values(error.constraints).join(', '),
        }));

        return new BadRequestException({
          success: false,
          statusCode: 400,
          message: validationErrorMessage,
          errors: formattedErrors,
          timestamp: new Date().toISOString(),
        });
      },
    }),
  );
  app.useGlobalInterceptors(
    new SuccessResponseInterceptor(),
    new CustomErrorInterceptor(),
  );
  app.enableCors();
  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError, throwError } from 'rxjs';
import { validationErrorMessage } from '../constants';

@Injectable()
export class CustomErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        if (error instanceof HttpException) {
          const status = error.getStatus();
          const response = error.getResponse();

          if (response['message'] === validationErrorMessage) {
            return throwError(() => new HttpException(response, status));
          }

          return throwError(
            () =>
              new HttpException(
                {
                  success: false,
                  statusCode: status,
                  message: response["message"],
                  errors: null,
                  timestamp: new Date().toISOString(),
                },
                status,
              ),
          );
        }

        return throwError(() => error);
      }),
    );
  }
}

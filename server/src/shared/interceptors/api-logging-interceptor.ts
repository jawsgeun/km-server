import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class ApiLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ApiLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const dateStarted = new Date();

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const requestLog = {
      method: request.method,
      url: request.url,
      path: request.path,
      params: request.params,
      query: request.query,
      body: request.body,
      clientIp: request.ip,
      userAgent: request.headers['user-agent'],
      session: request.session,
    };

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - dateStarted.getTime();
        const responseLog = {
          statusCode: response.statusCode,
        };
        const successLoggingData = {
          request: requestLog,
          response: responseLog,
          duration,
          dateRequested: dateStarted.toISOString(),
        };

        this.logger.log(JSON.stringify(successLoggingData));
      }),
      catchError((error) => {
        const duration = Date.now() - dateStarted.getTime();
        if (error instanceof HttpException) {
          const responseLog = {
            statusCode: error.getStatus(),
            errorMessage: error.message,
            errorResponse: error.getResponse(),
          };
          const errorLoggingData = {
            request: requestLog,
            response: responseLog,
            duration,
            dateRequested: dateStarted.toISOString(),
          };

          this.logger.log(JSON.stringify(errorLoggingData));
        } else {
          const responseLog = {
            statusCode: response.statusCode,
            errorMessage: error.message,
          };
          const errorLoggingData = {
            request: requestLog,
            response: responseLog,
            duration,
            dateRequested: dateStarted.toISOString(),
          };

          this.logger.log(JSON.stringify(errorLoggingData));
        }

        throw error;
      }),
    );
  }
}

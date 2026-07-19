import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { AppException } from '../exceptions/app.exception';
import { AppWarningException } from '../exceptions/app-warning.exception';

interface ErrorResponseBody {
  message: string;
  status: string;
  statusCode: number;
  path: string;
  timestamp: string;
  details?: unknown;
}

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger(AllExceptionFilter.name);
  }

  public catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let details: unknown;
    let status = 'error';

    if (exception instanceof AppWarningException) {
      statusCode = exception.statusCode;
      message = exception.message;
      details = exception.details;
      status = 'warning';
      this.logger.warn(`[${request.method} ${request.url}] ${message}`);
    } else if (exception instanceof AppException) {
      statusCode = exception.statusCode;
      message = exception.message;
      details = exception.details;
      this.logger.warn(`[${request.method} ${request.url}] ${message}`);
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const resp = exception.getResponse();
      if (typeof resp === 'string') {
        message = resp;
      } else if (typeof resp === 'object' && resp !== null) {
        const obj = resp as { message?: string | string[] };
        message = Array.isArray(obj.message) ? obj.message.join(', ') : (obj.message ?? message);
        details = resp;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(`[${request.method} ${request.url}] ${message}`, exception.stack);
    } else {
      this.logger.error(`[${request.method} ${request.url}] Unknown error`, JSON.stringify(exception));
    }

    const body: ErrorResponseBody = {
      message,
      status,
      statusCode,
      path: request.url,
      timestamp: new Date().toISOString(),
      details,
    };

    response.status(statusCode).json(body);
  }
}

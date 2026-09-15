import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch() //Bắt tât cả lỗi
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Lỗi hệ thống';
    let code = 'INTERNAL_ERROR';

    // Nếu là lỗi HTTP do mình chủ động throw
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse() as any;
      message = res.message || exception.message;
      code = 'HTTP_ERROR';
    }
    // Nếu là lỗi không lường trước (DB sập, syntax...)
    else {
      console.error('Unexpected error:', exception);
    }

    response.status(status).json({
      code: status,
      status: false,
      data: null,
      message,
      error: { code },
    });
  }
}

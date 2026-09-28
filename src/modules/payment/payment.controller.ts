import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { Request } from 'express';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}
  // Thêm vào PaymentController
  @Get('vnpay-return')
  async vnpayReturn(@Query() query: any) {
    await this.paymentService.verifyVnPayReturn(query);
  }
}

import { Controller, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly configService: ConfigService, // 👈 thêm để đọc FE_URL
  ) {}

  @Get('vnpay-return')
  async vnpayReturn(@Query() query: any, @Res() res: Response) {
    const feUrl =
      this.configService.get<string>('FE_URL') || 'http://localhost:3000';

    let vnpStatus: 'success' | 'failed' | 'error' = 'error';
    let orderId: string | null = null;

    try {
      const result = await this.paymentService.verifyVnPayReturn(query);
      orderId = result?.orderId || null;

      if (result?.status === 'success') {
        vnpStatus = 'success';
      } else if (result?.status === 'failed') {
        vnpStatus = 'failed';
      } else {
        // Trường hợp duplicate không có status rõ ràng
        vnpStatus = query['vnp_ResponseCode'] === '00' ? 'success' : 'failed';
      }
    } catch (err) {
      // verify fail (chữ ký sai, không tìm thấy order, amount mismatch...)
      vnpStatus = 'error';
      orderId = query['vnp_TxnRef'] || null;
    }

    // Build URL redirect về FE
    const params = new URLSearchParams();
    params.set('vnp', vnpStatus);
    params.set('payment', 'bank');
    if (orderId) params.set('code', orderId);

    const redirectUrl = `${feUrl}/order-success?${params.toString()}`;

    return res.redirect(302, redirectUrl);
  }
}

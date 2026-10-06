import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as querystring from 'qs';
import { OrdersService } from '../orders/orders.service';
import { RedisService } from '../redis/redis.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from '../orders/entities/order.entity';
import { Repository } from 'typeorm';
import { StructuredLogger } from '../../common/utils/logger.util';

@Injectable()
export class PaymentService {
  private readonly log = new StructuredLogger(PaymentService.name);
  constructor(
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => OrdersService))
    private readonly orderService: OrdersService,
    private readonly redisService: RedisService,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}
  // Hàm sắp xếp object theo key alphabet chuẩn VNPay
  private sortObject(obj: any) {
    let sorted: any = {};
    let str = [];
    let key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key));
      }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
      sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
    }
    return sorted;
  }
  createVnPayUrl(ipAddr: string, amount: number, orderId: string): string {
    //Thông tin mà VNPay yêu cầu(Datetime của req)
    process.env.TZ = 'Asia/Ho_Chi_Minh';

    const date = new Date();
    const createDate =
      date.getFullYear().toString() +
      String(date.getMonth() + 1).padStart(2, '0') +
      String(date.getDate()).padStart(2, '0') +
      String(date.getHours()).padStart(2, '0') +
      String(date.getMinutes()).padStart(2, '0') +
      String(date.getSeconds()).padStart(2, '0');
    //Lấy thông tin cấu hình
    const tmnCode = this.configService.get('VNP_TMN_CODE');
    const secretKey = this.configService.get('VNP_HASH_SECRET');
    const vnpUrl = this.configService.get('VNP_URL');
    const returnUrl = this.configService.get('VNP_RETURN_URL');

    // Số tiền VNPay yêu cầu nhân lên 100 (Ví dụ: 10,000 VNĐ -> truyền lên 1000000 ->Giá trị vẫn vậy chỉ là format phải như vậy)
    const amountInVND = amount * 100;
    //Toàn bộ thông tin gửi lên VNPay (vnp_Params)
    let vnp_Params: any = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = 'vn';
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = `Thanh toan don hang: ${orderId}`;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amountInVND;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;
    //VNPay yêu cầu format gửi lên phải chuẩn format thứ tự thường là alphabet a->b->c
    //Nếu không đồng bộ BE và VNPay có thứ tự chuỗi để kí khác nhau thì không xác thực được
    vnp_Params = this.sortObject(vnp_Params);
    //vnp_Params là 1 object qua stringify -> string
    const signData = querystring.stringify(vnp_Params, {
      encode: false,
    });

    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    //secretKey(env) + signData qua thuật toán mã hóa (HMAC-SHA512)-> chữ kí (signed) gắn vào dữ liệu gửi lên VNPay -> vnp_Params['vnp_SecureHash']
    vnp_Params['vnp_SecureHash'] = signed;

    return `${vnpUrl}?${querystring.stringify(vnp_Params, {
      encode: false,
    })}`;
  }

  // Thêm hàm này vào trong class PaymentService
  async verifyVnPayReturn(query: any) {
    const startTime = Date.now(); // ← để đo duration
    this.log.info('vnpay.callback.received', {
      txnNo: query['vnp_TransactionNo'],
      orderId: query['vnp_TxnRef'],
      amount: query['vnp_Amount'],
      responseCode: query['vnp_ResponseCode'],
      bankCode: query['vnp_BankCode'],
      ip: query['vnp_IpAddr'],
      // KHÔNG log vnp_SecureHash
    });
    // 1. Verify signature
    const secretKey = this.configService.get('VNP_HASH_SECRET');
    //Lấy toàn bộ dữ liệu lúc gửi lên ra
    let vnp_Params = { ...query };

    const secureHash = vnp_Params['vnp_SecureHash'];

    // Xóa 2 tham số hash đi vì lúc tạo hash ban đầu không có chúng
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    // Sắp xếp lại alphabet y hệt lúc tạo URL
    vnp_Params = this.sortObject(vnp_Params);

    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    // So sánh chữ ký tính lại với chữ ký VNPay gửi về xem có khớp nhau không
    if (!(secureHash === signed)) {
      this.log.warn('vnpay.signature.invalid', {
        txnNo: query['vnp_TransactionNo'],
        orderId: query['vnp_TxnRef'],
        ip: query['vnp_IpAddr'],
      });
      throw new BadRequestException('Chữ ký không hợp lệ (Kiểm tra thất bại!)');
    }
    // ③ LOG khi signature OK
    this.log.info('vnpay.signature.verified', {
      txnNo: query['vnp_TransactionNo'],
    });
    // 2. Chuẩn bị key + TTL
    const txnNo =
      query['vnp_TransactionNo'] ||
      `${query['vnp_TxnRef']}:${query['vnp_ResponseCode']}`;
    const key = `payment-callback:${txnNo}`;
    const TTL_LOCK = 60; //60s
    const TTL_DONE = 24 * 3600;
    // 3. Acquire lock
    const acquired = await this.redisService.setIdempotency(
      key,
      'PROCESSING',
      'EX',
      TTL_LOCK,
      'NX',
    );
    if (!acquired) {
      const status = await this.redisService.get(key);
      this.log.info('vnpay.callback.duplicate', {
        txnNo,
        orderId: query['vnp_TxnRef'],
        cachedStatus: status,
      });

      const isDone = status === 'DONE';
      const orderId = query['vnp_TxnRef'];
      const amount = Number(query['vnp_Amount']) / 100;

      return {
        orderId,
        amount,
        transactionNo: query['vnp_TransactionNo'],
        status: query['vnp_ResponseCode'] === '00' ? 'success' : 'failed',
        message: isDone ? 'Đã xử lý' : 'Đang xử lý',
      };
    }
    this.log.info('vnpay.callback.locked', { txnNo, key });
    // 4. Xử lý Nếu khớp kiểm tra mã phản hồi của giao dịch (vnp_ResponseCode === '00' nghĩa là thành công)
    try {
      const orderId = query['vnp_TxnRef'];
      const amount = Number(query['vnp_Amount']) / 100; // Chia lại cho 100 vì lúc gửi lên nhân 100
      if (isNaN(amount) || amount <= 0) {
        this.log.warn('vnpay.callback.invalid_amount', {
          txnNo,
          orderId,
          rawAmount: query['vnp_Amount'],
        });
        throw new BadRequestException('Số tiền không hợp lệ');
      }
      // 5. Giao dịch thất bại → không mark PAID, nhưng set DONE
      if (query['vnp_ResponseCode'] !== '00') {
        this.log.warn('vnpay.callback.transaction_failed', {
          txnNo,
          orderId,
          responseCode: query['vnp_ResponseCode'],
          message: query['vnp_Message'],
        });
        await this.redisService.setIdempotency(key, 'DONE', 'EX', TTL_DONE);
        return {
          orderId,
          amount,
          transactionNo: query['vnp_TransactionNo'],
          status: 'failed',
          message: 'Giao dịch thất bại',
        };
      }
      // 6. Update DB (transaction + pessimistic lock đã nằm trong service)
      await this.orderService.markOrderAsPaid(
        orderId,
        amount,
        query['vnp_TransactionNo'],
      );
      await this.redisService.setIdempotency(key, 'DONE', 'EX', TTL_DONE);
      this.log.info('vnpay.callback.success', {
        txnNo,
        orderId,
        amount,
        duration: Date.now() - startTime,
      });
      return {
        orderId,
        amount,
        transactionNo: query['vnp_TransactionNo'],
        status: 'success',
        message: 'Thanh toán thành công',
      };
    } catch (err: any) {
      this.log.error(
        'vnpay.callback.failed',
        {
          txnNo,
          orderId: query['vnp_TxnRef'],
          amount: Number(query['vnp_Amount']) / 100,
          reason: err.message,
          duration: Date.now() - startTime,
        },
        err,
      );
      await this.redisService.del(key);
      // Trả message chung chung, không leak chi tiết
      throw new BadRequestException(
        'Xử lý callback thất bại, vui lòng thử lại.',
      );
    }
  }
}

import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class MailService {
  constructor(@InjectQueue('mail') private mailQueue: Queue) {}
  async sendWelcomeMail(to: string, name: string) {
    //đẩy 1 job vào queue
    await this.mailQueue.add(
      //tên job
      'send-mail',
      //dữ liệu
      {
        to,
        subject: 'Chào mừng!',
        html: `<h1>Chào ${name}, bạn đã đăng ký thành công</h1>`,
      },
      //option
      {
        attempts: 3, // fail thì retry 3 lần
        backoff: { type: 'exponential', delay: 5000 }, // mỗi lần cách nhau 5s
        removeOnComplete: true, //xóa khỏi redis khi thành công
      },
    );
  }

  private buildOtpEmailHtml(otp: string): string {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
      <h2 style="color: #333;">Xác thực đăng ký</h2>
      <p>Mã OTP của bạn:</p>
      <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #5d3fd3; border-radius: 8px;">
        ${otp}
      </div>
      <p style="color: #888; font-size: 12px;">Mã có hiệu lực trong 5 phút.</p>
    </div>
  `;
  }

  async queueSendOtpMail(email: string, otp: string) {
    await this.mailQueue.add(
      'send-mail',
      {
        to: email,
        subject: 'Mã OTP xác thực đăng ký',
        html: this.buildOtpEmailHtml(otp),
      },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: true,
      },
    );
  }
}

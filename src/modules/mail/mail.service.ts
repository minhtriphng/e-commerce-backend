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
}

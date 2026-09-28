import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { NodeMailerService } from './node-mailer.service'; // cái nodemailer ở bài trước

@Processor('mail') // tên phải khớp với queue đã đăng ký
export class MailProcessor extends WorkerHost {
  constructor(private nodeMailerService: NodeMailerService) {
    super();
  }

  async process(job: Job) {
    const { to, subject, html } = job.data;
    await this.nodeMailerService.sendMail(to, subject, html);
    console.log(`Đã gửi mail cho ${to}`);
  }
}

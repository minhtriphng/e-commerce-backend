import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { BullModule } from '@nestjs/bullmq';
import { MailProcessor } from './mail.processor';
import { NodeMailerService } from './node-mailer.service';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'mail' }), // 👈 BẮT BUỘC
  ],
  controllers: [MailController],
  providers: [MailService, MailProcessor, NodeMailerService],
  exports: [MailService],
})
export class MailModule {}

import { forwardRef, Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../orders/entities/order.entity';
import { OrdersModule } from '../orders/orders.module';
import { RedisService } from '../redis/redis.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order]), forwardRef(() => OrdersModule)],
  controllers: [PaymentController],
  providers: [PaymentService, RedisService],
  exports: [PaymentService],
})
export class PaymentModule {}

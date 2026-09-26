import { forwardRef, Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { ProductVariant } from '../products/entities/product-variant.entity';
import { Race } from '../../common/entities/race.entity';
import { RedisService } from '../redis/redis.service';
import { PaymentService } from '../payment/payment.service';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, ProductVariant, Race]),
    forwardRef(() => PaymentModule),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, RedisService],
  exports: [OrdersService],
})
export class OrdersModule {}

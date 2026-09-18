import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { ProductVariant } from '../products/entities/product-variant.entity';
import { Race } from '../../common/entities/race.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, ProductVariant, Race])],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}

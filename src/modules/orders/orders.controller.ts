import { Body, Controller, Get, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // @Post()
  // async createOrder(@Body() body: CreateOrderDto) {
  //   const userId = '01a0859a-a263-72b0-8fe0-3485e3819355';
  //   return this.ordersService.createOrderSimple(userId, body);
  // }

  @Get('test-race')
  async testRaceCondition() {
    const id = '01a0b3ba-2fc2-74f5-8d60-3f5b23e40d49';
    const quantity = 1;
    return this.ordersService.resolveRaceConditon(id, quantity);
  }
}

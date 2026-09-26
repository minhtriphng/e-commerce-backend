import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AuthGuard } from '@nestjs/passport';
import { AddCartDto } from './dto/add-cart.dto';
import { IdempotencyInterceptor } from '../../interceptors/idempotency.interceptor';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseInterceptors(IdempotencyInterceptor)
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createOrder(@Req() req: any, @Body() body: CreateOrderDto) {
    // Không cần nhận @Headers('idempotency-key') nữa
    // Lấy IP của client gọi lên
    const ipAddr = (req.headers['x-forwarded-for'] ||
      req.socket.remoteAddress ||
      '127.0.0.1') as string;
    return this.ordersService.createOrder(req.user.userId, body, ipAddr);
  }

  @Get('test-race')
  async testRaceCondition() {
    const id = '01a0b3ba-2fc2-74f5-8d60-3f5b23e40d49';
    const quantity = 1;
    return this.ordersService.resolveRaceConditon(id, quantity);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('add-cart')
  addShoppingCart(
    @Body() body: AddCartDto,
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.ordersService.addShoppingCart(
      req.user.userId,
      body.variantId,
      body.quantity,
      res,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('get-cart')
  getShoppingCart(@Req() req: any) {
    return this.ordersService.getShoppingCart(req.user.userId);
  }
}

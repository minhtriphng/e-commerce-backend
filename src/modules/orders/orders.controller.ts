import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
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
import { PaymentMethod } from '../../common/enums/status.enum';
import { UpdateCartDto } from './dto/update-cart.dto';

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

  @UseGuards(AuthGuard('jwt'))
  @Get('my-orders')
  async getMyOrders(@Req() req: any) {
    const userId = req.user.userId; // 👈 Lấy userId từ JWT payload
    return await this.ordersService.findMyOrders(userId);
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

  @UseGuards(AuthGuard('jwt'))
  @Patch('cart/:variantId')
  async updateCart(
    @Req() req: any,
    @Param('variantId') variantId: string,
    @Body() body: UpdateCartDto,
  ) {
    return this.ordersService.updateShoppingCart(
      req.user.userId,
      variantId,
      body.quantity,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('cart/:variantId')
  async removeCart(@Req() req: any, @Param('variantId') variantId: string) {
    return this.ordersService.removeShoppingCart(req.user.userId, variantId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('cart')
  async clearCart(@Req() req: any) {
    return this.ordersService.clearShoppingCart(req.user.userId);
  }
  @UseGuards(AuthGuard('jwt'))
  @Get('my-orders/:id')
  async getMyOrderById(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.userId;
    return await this.ordersService.findMyOrderById(userId, id);
  }
}

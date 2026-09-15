import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}
  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    return await this.productsService.create(createProductDto);
  }

  // @Get()
  // async findAll() {
  //   return await this.productsService.findAll();
  // }
  // @Get()
  // async findQuery(@Query() query: any) {
  //   return await this.productsService.findQuery(query);
  // }
}

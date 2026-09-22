import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}
  @Post()
  async createProduct(@Body() createProductDto: CreateProductDto) {
    return await this.productsService.createProduct(createProductDto);
  }

  @Get()
  async filterProducts(@Query() filterDto: FilterProductDto) {
    return this.productsService.filterProducts(filterDto);
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

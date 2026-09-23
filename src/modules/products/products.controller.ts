import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}
  @Post('category')
  async createCategory(@Body() body: { name: string }) {
    return await this.productsService.createCategory(body.name);
  }

  @Post()
  async createProduct(@Body() createProductDto: CreateProductDto) {
    return await this.productsService.createProduct(createProductDto);
  }

  @Get()
  async filterProducts(@Query() filterDto: FilterProductDto) {
    return this.productsService.filterProducts(filterDto);
  }

  @Get('search')
  async search(@Query('q') query: string) {
    return await this.productsService.searchByName(query);
  }

  @Post('cache-product')
  async getProductDetail(@Body() body: { id: string }) {
    return await this.productsService.getProductDetail(body.id);
  }
}

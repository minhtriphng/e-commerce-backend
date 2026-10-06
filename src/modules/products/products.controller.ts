import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}
  @Post('category')
  async createCategory(@Body() body: { name: string }) {
    return await this.productsService.createCategory(body.name);
  }

  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'thumbnail', maxCount: 1 }, // 👈 1 ảnh chính
        { name: 'gallery', maxCount: 3 }, // 👈 tối đa 10 ảnh phụ
      ],
      {
        limits: { fileSize: 5 * 1024 * 1024 }, //giới hạn 5mb
      },
    ),
  )
  @Post()
  async createProduct(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles()
    files: {
      thumbnail?: Express.Multer.File[];
      gallery?: Express.Multer.File[];
    },
  ) {
    return await this.productsService.createProduct(createProductDto, files);
  }

  @Get()
  async filterProducts(@Query() filterDto: FilterProductDto) {
    return this.productsService.filterProducts(filterDto);
  }

  @Get('search')
  async search(@Query('q') query: string) {
    return await this.productsService.searchByName(query);
  }

  @Get('latest') // Đường dẫn sẽ là: GET /products/latest
  async getLatest() {
    return await this.productsService.getLatestProducts();
  }

  @Get('category')
  async getCategory() {
    return await this.productsService.getCategory();
  }

  @Get(':id')
  async getProductDetail(@Param('id') id: string) {
    return await this.productsService.getProductDetail(id);
  }
}

import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

// 1. Tải các biến môi trường từ file .env
dotenv.config();

// 2. Xuất cấu hình dùng chung
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  synchronize: false,
};

// 3. Khởi tạo AppDataSource dành cho TypeORM CLI (chạy Migration)
export const AppDataSource = new DataSource(dataSourceOptions);

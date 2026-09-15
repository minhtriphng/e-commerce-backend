import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { dataSourceOptions } from './data-source.config';

export const typeOrmAsyncConfig: TypeOrmModuleAsyncOptions = {
  useFactory: () => dataSourceOptions,
};

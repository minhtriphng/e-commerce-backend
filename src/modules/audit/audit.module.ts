import { Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockAuditLog } from './entities/stock-audit-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StockAuditLog])],
  controllers: [AuditController],
  providers: [AuditService],
})
export class AuditModule {}

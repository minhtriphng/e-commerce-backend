// src/modules/audit/audit.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { StockAuditLog } from './entities/stock-audit-log.entity';
import { AuditLog } from './dto/audit-log.dto';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(StockAuditLog)
    private readonly repo: Repository<StockAuditLog>,
  ) {}

  async logStockChange(input: AuditLog, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(StockAuditLog) : this.repo;

    await repo.save(
      repo.create({
        productVariantId: input.productVariantId,
        actorId: input.actorId,
        oldStock: input.oldStock,
        newStock: input.newStock,
        reason: input.reason,
        referenceId: input.referenceId ?? null,
      }),
    );
  }
}

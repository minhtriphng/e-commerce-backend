import { Logger } from '@nestjs/common';

export class StructuredLogger {
  private readonly logger: Logger;

  constructor(context: string) {
    this.logger = new Logger(context);
  }

  info(event: string, data: Record<string, any>) {
    this.logger.log(JSON.stringify({ event, ...data }));
  }

  warn(event: string, data: Record<string, any>) {
    this.logger.warn(JSON.stringify({ event, ...data }));
  }

  error(event: string, data: Record<string, any>, error?: Error) {
    this.logger.error(JSON.stringify({ event, ...data }), error?.stack);
  }

  debug(event: string, data: Record<string, any>) {
    this.logger.debug(JSON.stringify({ event, ...data }));
  }
}

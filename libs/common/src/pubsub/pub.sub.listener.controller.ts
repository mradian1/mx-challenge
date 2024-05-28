import { CacheService } from '@multiversx/sdk-nestjs-cache';
import { Controller, Logger } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { ApiMetricsService } from '../metrics';
import { TransactionsEventDTO } from '../utils/transactions.event.dto';

@Controller()
export class PubSubListenerController {
  private logger: Logger;

  constructor(private readonly cacheService: CacheService, private readonly metricsService: ApiMetricsService) {
    this.logger = new Logger(PubSubListenerController.name);
  }

  @EventPattern('deleteCacheKeys')
  async deleteCacheKey(keys: string[]) {
    for (const key of keys) {
      this.logger.log(`Deleting local cache key ${key}`);
      await this.cacheService.deleteLocal(key);
    }
  }
  @EventPattern('onTransactions')
  async onTransactionsReceived(payload: TransactionsEventDTO) {
    this.logger.log(
      `Transactions Received with payload '${JSON.stringify(payload)}'`,
    );
    await this.metricsService.setTransactionsValue(payload.shardId, payload.value);
    await this.metricsService.setTrxTimestampValue(payload.shardId, payload.timestamp, payload.value);
    //await this.metricsService.doNothing();
  }
}

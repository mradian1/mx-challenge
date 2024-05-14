import { CacheService } from '@multiversx/sdk-nestjs-cache';
import { Locker } from '@multiversx/sdk-nestjs-common';
import { TransactionProcessor } from '@multiversx/sdk-transaction-processor';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import {
  ApiConfigService,
  //ApiMetricsService,
  CacheInfo,
} from '@mvx-monorepo/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class TransactionProcessorService {
  private transactionProcessor: TransactionProcessor =
    new TransactionProcessor();
  private readonly logger: Logger;

  constructor(
    private readonly apiConfigService: ApiConfigService,
    private readonly cacheService: CacheService,
    //private readonly metricsService: ApiMetricsService,
    @Inject('PUBSUB_SERVICE') private readonly client: ClientProxy,
  ) {
    this.logger = new Logger(TransactionProcessorService.name);
  }

  @Cron('*/6 * * * * *')
  async handleNewTransactions() {
    await Locker.lock('newTransactions', async () => {
      await this.transactionProcessor.start({
        gatewayUrl: this.apiConfigService.getApiUrl(),
        maxLookBehind:
          this.apiConfigService.getTransactionProcessorMaxLookBehind(),
        // eslint-disable-next-line require-await
        onTransactionsReceived: async (
          shardId,
          nonce,
          transactions,
          statistics,
        ) => {
          const totalValue: number = transactions
            .map((transaction) => parseInt(transaction.value))
            .reduce((a, b) => a + b);
          this.logger.log(
            `Received ${transactions.length} transactions of value ${totalValue} on shard ${shardId} and nonce ${nonce}. Time left: ${statistics.secondsLeft}`,
          );
          //await this.metricsService.setTransactionsValue(shardId, totalValue);
          this.client.emit('onTransactions', {
            length: transactions.length,
            value: totalValue,
            shardId: shardId,
          });
        },
        getLastProcessedNonce: async (shardId) => {
          return await this.cacheService.getRemote(
            CacheInfo.LastProcessedNonce(shardId).key,
          );
        },
        setLastProcessedNonce: async (shardId, nonce) => {
          await this.cacheService.setRemote(
            CacheInfo.LastProcessedNonce(shardId).key,
            nonce,
            CacheInfo.LastProcessedNonce(shardId).ttl,
          );
        },
      });
    });
  }
}

import { CacheService } from '@multiversx/sdk-nestjs-cache';
import { Locker } from '@multiversx/sdk-nestjs-common';
//import { TransactionProcessor } from '@multiversx/sdk-transaction-processor';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ApiConfigService, CacheInfo } from '@mvx-monorepo/common';
import { ClientProxy } from '@nestjs/microservices';
import { TransactionProcessor } from '@mradian1/sdk-transaction-processor-branch';

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
          round,
          timestamp,
          transactions,
          statistics,
          _blockHash,
        ) => {
          const totalValue: bigint = transactions
            .map((transaction) => transaction.sourceShard == shardId ?BigInt(transaction.value) : BigInt(0))
            .reduce((a, b) => a + b);

          this.logger.log(
            `Received ${transactions.length} transactions of value ${totalValue} = ${this.toEgld(totalValue,8)}egld on shard ${shardId} and nonce ${nonce}. Time stamp: ${timestamp} - round: ${round}, time left: ${statistics.secondsLeft} sec`,
          );

          this.client.emit('onTransactions', {
            length: transactions.length,
            value: this.toEgld(totalValue,8), //totalValue,
            shardId: shardId,
            timestamp: timestamp,
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
  toEgld(bigIntVal: bigint, precision: number): number {
    const divisor = 10**precision;
    const convertToEgld: bigint = BigInt (10 ** 18);
    return Number((bigIntVal*BigInt(divisor)/convertToEgld))/divisor;
  }
}


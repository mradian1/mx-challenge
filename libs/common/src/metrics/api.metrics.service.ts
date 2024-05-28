import { MetricsService } from '@multiversx/sdk-nestjs-monitoring';
import { Injectable } from '@nestjs/common';
import { register, Gauge } from 'prom-client';

@Injectable()
export class ApiMetricsService {
  private static lastProcessedNonceGauge: Gauge<string>;
  private static transactionsValueGauge: Gauge<string>;
  private static trxTimestampValueGauge: Gauge<string>;

  constructor(private readonly metricsService: MetricsService) {
    if (!ApiMetricsService.transactionsValueGauge) {
      ApiMetricsService.transactionsValueGauge = new Gauge({
        name: 'transactions_total_value',
        help: 'Total value of transactions',
        labelNames: ['shardId'],
      });
    }
    if (!ApiMetricsService.trxTimestampValueGauge) {
      ApiMetricsService.trxTimestampValueGauge = new Gauge({
        name: 'transactions_total_value_timestamp',
        help: 'Total value of transactions with timestamp',
        labelNames: ['shardId', 'timestamp'],
      });
    }
    if (!ApiMetricsService.lastProcessedNonceGauge) {
      ApiMetricsService.lastProcessedNonceGauge = new Gauge({
        name: 'last_processed_nonce',
        help: 'Last processed nonce of the given shard',
        labelNames: ['shardId'],
      });
    }
    register.registerMetric(ApiMetricsService.transactionsValueGauge);
  }

  setLastProcessedNonce(shardId: number, nonce: number) {
    ApiMetricsService.lastProcessedNonceGauge.set({ shardId }, nonce);
  }

  // eslint-disable-next-line require-await
  async setTransactionsValue(shardId: number, totalValue: number) {
    ApiMetricsService.transactionsValueGauge.inc(
      { shardId: shardId.toString() },
      totalValue
    );
  }
  setTrxTimestampValue(shardId: number, timestamp: number, totalValue: number) {
    ApiMetricsService.trxTimestampValueGauge.set(
      { shardId: shardId.toString(), timestamp: timestamp },
      totalValue
    );
  }
  async doNothing(){}

  async getMetrics(): Promise<string> {
    let baseMetrics: string;
    let currentMetrics: string;
    let gaugeInfo;

    try {
      baseMetrics = await this.metricsService.getMetrics();
      currentMetrics = await register.metrics();
      gaugeInfo = JSON.stringify(await ApiMetricsService.trxTimestampValueGauge.get());
      await this.clearGauge();
      ApiMetricsService.trxTimestampValueGauge.reset();

    } catch (exception) {
        console.log('Error retrieving metrics:', exception);
        return 'Error retrieving metrics';
    }

    console.log(`returning metrics - Transaction gauge value = ${gaugeInfo}`);
    return baseMetrics + '\n' + currentMetrics;
  }
  //Reset gauge values to 0 for all labels
  async clearGauge(){
    const values = (await ApiMetricsService.transactionsValueGauge.get()).values;

    values.forEach(elem => {
      const shardId: string = elem.labels.shardId?.toString() ?? 'defaultShardId';
      const val: string = elem.value?.toString() ?? '0';
      ApiMetricsService.transactionsValueGauge.dec({ shardId: shardId.toString() }, parseFloat(val));
    });
  }
}

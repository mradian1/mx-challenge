import { MetricsService } from '@multiversx/sdk-nestjs-monitoring';
import { Injectable } from '@nestjs/common';
import { register, Gauge } from 'prom-client';

@Injectable()
export class ApiMetricsService {
  private static lastProcessedNonceGauge: Gauge<string>;
  private static transactionsValueGauge: Gauge<string>;

  constructor(private readonly metricsService: MetricsService) {
    if (!ApiMetricsService.transactionsValueGauge) {
      ApiMetricsService.transactionsValueGauge = new Gauge({
        name: 'transactions_total_value',
        help: 'Total value of transactions',
        labelNames: ['shardId'],
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

  async setTransactionsValue(shardId: number, totalValue: number) {
    await ApiMetricsService.transactionsValueGauge.inc(
      { shardId: shardId.toString() },
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
      gaugeInfo = await ApiMetricsService.transactionsValueGauge.get();
      ApiMetricsService.transactionsValueGauge.reset();
    } catch (exception) {
      console.log('Error retrieving metrics:', exception);
      return 'Error retrieving metrics';
    }

    console.log(`returning metrics - Transaction gauge value = ${JSON.stringify(gaugeInfo)}`);
    return baseMetrics + '\n' + currentMetrics;
  }
}

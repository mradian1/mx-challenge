import { Injectable } from '@nestjs/common';
import { register, Gauge } from 'prom-client';
import { ApiMetricsService } from '@mvx-monorepo/common';

@Injectable()
export class TransactionMetricsService {
  private static transactionsValueGauge: Gauge<string>;

  constructor(private readonly metricsService: ApiMetricsService) {
    if (!TransactionMetricsService.transactionsValueGauge) {
      TransactionMetricsService.transactionsValueGauge = new Gauge({
        name: 'transactions_total_value',
        help: 'Total value of transactions',
        labelNames: ['shardId'],
      });
    }
  }

  updateMetrics(shardId: number, totalValue: number) {
    //updateMetrics(shardId: number, nonce: number) {
    console.log('transaction metrics - updateMetrics');
    TransactionMetricsService.transactionsValueGauge.set(
      { shardId },
      totalValue,
    );
  }
  async getMetrics(): Promise<string> {
    const baseMetrics = await this.metricsService.getMetrics();
    const currentMetrics = await register.metrics();
    console.log('transaction metrics - getMetrics');
    return baseMetrics + '\n' + currentMetrics;
  }
}

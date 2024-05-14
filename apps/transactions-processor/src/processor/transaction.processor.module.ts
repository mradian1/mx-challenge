import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import {
  ApiConfigModule,
  ApiMetricsModule,
  DynamicModuleUtils,
} from '@mvx-monorepo/common';
import { TransactionProcessorService } from './transaction.processor.service';
import configuration from '../../config/configuration';
//import { TransactionMetricsService } from './transaction.processor.metrics';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ApiConfigModule.forRoot(configuration),
    DynamicModuleUtils.getCachingModule(configuration),
    ApiMetricsModule,
  ],
  providers: [
    TransactionProcessorService, //TransactionMetricsService,
    DynamicModuleUtils.getPubSubService(),
  ],
})
export class TransactionProcessorModule {}

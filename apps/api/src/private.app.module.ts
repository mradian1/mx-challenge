import { PubSubModule } from './websockets/pub.sub.module';
import { Module } from '@nestjs/common';
import { TestSocketController } from './endpoints/test-sockets/test.socket.controller';
import { TestSocketModule } from './endpoints/test-sockets/test.socket.module';
import { CacheController } from './endpoints/caching/cache.controller';
//import { PubSubController } from './websockets/pub.sub.controller';
import {
  ApiMetricsController,
  HealthCheckController,
} from '@mvx-monorepo/common';
import { ApiMetricsModule, DynamicModuleUtils } from '@mvx-monorepo/common';
import { LoggingModule } from '@multiversx/sdk-nestjs-common';
import configuration from '../config/configuration';

@Module({
  imports: [
    LoggingModule,
    ApiMetricsModule,
    DynamicModuleUtils.getCachingModule(configuration),
    TestSocketModule,
    PubSubModule,
  ],
  providers: [
    DynamicModuleUtils.getNestJsApiConfigService(),
    DynamicModuleUtils.getPubSubService(),
  ],
  controllers: [
    ApiMetricsController,
    CacheController,
    HealthCheckController,
    TestSocketController,
    //PubSubController,
  ],
})
export class PrivateAppModule {}

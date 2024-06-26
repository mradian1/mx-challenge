import { Module } from '@nestjs/common';
import { DynamicModuleUtils } from '@mvx-monorepo/common';
import { AuthController } from './auth/auth.controller';
import { EndpointsServicesModule } from './endpoints.services.module';
import { ExampleController, HealthCheckController } from '@mvx-monorepo/common';
import { TokensController } from './tokens/token.controller';
import { UsersController } from './users/user.controller';
import { HelloChallengeController } from './hello-challenge/hello-challenge.controller';

@Module({
  imports: [EndpointsServicesModule],
  providers: [DynamicModuleUtils.getNestJsApiConfigService()],
  controllers: [
    AuthController,
    ExampleController,
    HealthCheckController,
    UsersController,
    TokensController,
    HelloChallengeController,
  ],
})
export class EndpointsControllersModule {}

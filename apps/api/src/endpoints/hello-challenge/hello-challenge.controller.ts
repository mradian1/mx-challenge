import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('challenge')
@Controller('challenge')
export class HelloChallengeController {
  @Get()
  getHello(): string {
    return 'Hello from the challenge project';
  }
}

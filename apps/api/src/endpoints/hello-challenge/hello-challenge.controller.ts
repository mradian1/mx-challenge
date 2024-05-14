import { Controller, Get } from '@nestjs/common';

@Controller('challenge')
export class HelloChallengeController {
  @Get()
  getHello(): string {
    return 'Hello from the challenge project';
  }
}

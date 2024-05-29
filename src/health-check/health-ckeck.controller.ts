import { Controller, Get } from '@nestjs/common';

@Controller('/')
export class HelthCkeckController {
  @Get()
  healthCheck(): string {
    return 'Payments Microservice is up and running!';
  }
}

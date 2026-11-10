import { Controller, Get, Post , Body } from '@nestjs/common';
import { AppService } from './app.service';
// import { SignupDto } from './auth/dtos/signup.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Get('/health')
  healthCheck(): string {
    return 'OK';
  }
  // @Post('signup') //signup
  // async signUp(@Body() signupData: SignupDto) {}

}

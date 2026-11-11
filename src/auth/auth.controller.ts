import { Body, Controller, Get, Post, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dtos/signup.dto';
import { LoginDto } from './dtos/login.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // TODO Post signup
  @Post('register')
  async signup(@Body() signupData: SignupDto) {
    return await this.authService.signUp(signupData);
  }

  // TODO Post login
  @Post('login')
  @HttpCode(200)
  async login(@Body() LoginData: LoginDto) {
    return await this.authService.login(LoginData);
  }

  // POST refresh Token
  @Post('refresh')
  async refresh(@Body() refreshData: RefreshTokenDto) {
    return await this.authService.refreshToken(refreshData);
  }
}

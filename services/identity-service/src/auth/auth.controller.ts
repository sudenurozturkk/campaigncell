import { Controller, Post, Body, Request, UseGuards, Get, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('send-otp')
  async sendOtp(@Body() body: { gsmNumber: string }) {
    return this.authService.sendOtp(body.gsmNumber);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() body: { gsmNumber: string; otpCode: string }) {
    return this.authService.verifyOtp(body.gsmNumber, body.otpCode);
  }

  @Post('login')
  async login(@Body() body: any) {
    const user = await this.authService.validateUser(body.identifier, body.password);
    if (!user) {
      throw new UnauthorizedException('E-posta veya parola hatalı');
    }
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() body: any) {
    return this.authService.registerSubscriber(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    return req.user;
  }
}

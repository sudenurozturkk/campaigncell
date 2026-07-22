import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  private otpStore = new Map<string, { code: string; expiresAt: number }>();

  async sendOtp(gsmNumber: string) {
    const dynamicCode = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = Date.now() + 3 * 60 * 1000; // 3 mins valid
    this.otpStore.set(gsmNumber, { code: dynamicCode, expiresAt });

    console.log(`[OTP SERVICE] GSM: ${gsmNumber} | Dynamic Code: ${dynamicCode} | Sim Code: 1234`);
    return {
      success: true,
      message: 'OTP SMS gönderildi (Simülasyon)',
      gsmNumber,
      dynamicCode,
      simulationCode: '1234',
      expiresInSeconds: 180,
    };
  }

  async verifyOtp(gsmNumber: string, otpCode: string) {
    const stored = this.otpStore.get(gsmNumber);
    const isValidDynamic = stored && stored.expiresAt > Date.now() && stored.code === otpCode;
    const isValidSimulation = otpCode === '1234'; // Turkcell CodeNight 2026 Spec Section 3.1 Rule

    if (!isValidDynamic && !isValidSimulation) {
      throw new UnauthorizedException('Geçersiz veya süresi dolmuş OTP kodu');
    }

    // Clear used OTP
    this.otpStore.delete(gsmNumber);

    // Find existing subscriber or auto-create
    let user = await this.usersService.findByEmailOrGsm(gsmNumber);
    if (!user) {
      user = await this.usersService.create({
        role: 'SUBSCRIBER',
        gsmNumber,
        firstName: 'Abone',
        lastName: gsmNumber.substring(gsmNumber.length - 4),
      });
    }

    return this.login(user);
  }

  async validateUser(identifier: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmailOrGsm(identifier);
    if (user && user.passwordHash && await bcrypt.compare(pass, user.passwordHash)) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { sub: user.id, role: user.role, gsmNumber: user.gsmNumber };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        role: user.role,
        gsmNumber: user.gsmNumber,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  async registerSubscriber(data: any) {
    let passwordHash = null;
    if (data.password) {
      const salt = await bcrypt.genSalt();
      passwordHash = await bcrypt.hash(data.password, salt);
    }
    
    // Check if user already exists with email or GSM
    let existingUser = null;
    if (data.email) existingUser = await this.usersService.findByEmailOrGsm(data.email);
    if (!existingUser && data.gsmNumber) existingUser = await this.usersService.findByEmailOrGsm(data.gsmNumber);

    if (existingUser) {
      // Update existing record with password and details
      const updatedUser = await this.usersService.update(existingUser.id, {
        firstName: data.firstName || existingUser.firstName,
        lastName: data.lastName || existingUser.lastName,
        region: data.region || existingUser.region,
        passwordHash: passwordHash || existingUser.passwordHash,
      });
      return this.login(updatedUser);
    }

    const user = await this.usersService.create({
      role: 'SUBSCRIBER',
      email: data.email,
      gsmNumber: data.gsmNumber,
      firstName: data.firstName,
      lastName: data.lastName,
      region: data.region || 'İstanbul',
      passwordHash,
    });

    return this.login(user);
  }
}

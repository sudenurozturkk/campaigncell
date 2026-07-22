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

  async validateUser(identifier: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmailOrGsm(identifier);
    if (user && user.passwordHash && await bcrypt.compare(pass, user.passwordHash)) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async registerSubscriber(data: any) {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(data.password, salt);
    
    return this.usersService.create({
      role: 'SUBSCRIBER',
      gsmNumber: data.gsmNumber,
      firstName: data.firstName,
      lastName: data.lastName,
      passwordHash: hash
    });
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmailOrGsm(identifier: string) {
    return this.prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { gsmNumber: identifier }
        ]
      }
    });
  }

  async create(data: any) {
    return this.prisma.user.create({ data });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}

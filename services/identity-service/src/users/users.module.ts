import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { AdminController } from './admin.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdminController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

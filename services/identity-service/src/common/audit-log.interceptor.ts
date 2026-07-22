import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    
    return next.handle().pipe(
      tap(async () => {
        // Very basic audit log for write operations
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
            try {
                await this.prisma.auditLog.create({
                    data: {
                        userId: req.user?.id || null,
                        action: req.method + ' ' + req.url,
                        ipAddress: req.ip || null,
                        result: 'SUCCESS'
                    }
                });
            } catch (e) {
                console.error('Failed to write audit log', e);
            }
        }
      }),
    );
  }
}

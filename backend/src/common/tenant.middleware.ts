import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export interface TenantRequest extends Request {
  tenantId: string;
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    const tenantId = req.header('x-tenant-id');
    if (!tenantId) {
      throw new BadRequestException('x-tenant-id header is required');
    }
    (req as TenantRequest).tenantId = tenantId;
    next();
  }
}

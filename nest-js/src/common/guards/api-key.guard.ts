import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * Lightweight shared-secret guard applied globally. Requires header
 * `x-api-key: <API_KEY>` on every route not decorated with @Public().
 * If no API_KEY is configured the guard is a no-op (development convenience).
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly apiKey: string;

  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('auth.apiKey') ?? '';
  }

  public canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic === true) {
      return true;
    }

    if (this.apiKey.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const provided = request.header('x-api-key');
    if (provided !== this.apiKey) {
      throw new UnauthorizedException('Invalid or missing API key');
    }
    return true;
  }
}

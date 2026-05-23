import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class OfflineSyncInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Get client's sync version from request header
    const clientSyncVersion = request.headers['x-sync-version'];
    const clientSyncTimestamp = request.headers['x-sync-timestamp'];

    // Set server sync headers for response
    // These help clients resolve conflicts during offline-first sync
    response.setHeader('x-sync-version', '1.0');
    response.setHeader('x-sync-timestamp', new Date().toISOString());
    response.setHeader('x-sync-server-time', Date.now().toString());

    return next.handle().pipe(
      map((data) => {
        // Attach sync metadata to response for client conflict resolution
        if (data && typeof data === 'object') {
          return {
            ...data,
            _syncMeta: {
              version: '1.0',
              timestamp: new Date().toISOString(),
              clientVersion: clientSyncVersion || null,
              clientTimestamp: clientSyncTimestamp || null,
              conflictResolution: 'server-wins', // Can be customized per entity
            },
          };
        }
        return data;
      }),
    );
  }
}

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  data: T;
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        // Handle paginated responses
        if (data && typeof data === 'object' && 'data' in data && 'total' in data) {
          return {
            success: true,
            data: data.data,
            meta: {
              pagination: {
                page: data.page || 1,
                limit: data.limit || 10,
                total: data.total || 0,
                totalPages: data.totalPages || Math.ceil((data.total || 0) / (data.limit || 10)),
              },
            },
            timestamp: new Date().toISOString(),
          };
        }

        // Handle regular responses
        return {
          success: true,
          data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}

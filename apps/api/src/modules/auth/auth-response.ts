import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
  CallHandler,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

interface HttpResponse {
  statusCode: number
  status(code: number): this
  json(body: object): void
}

@Injectable()
export class AuthResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const response = context.switchToHttp().getResponse<HttpResponse>()
    return next.handle().pipe(
      map((body: Record<string, unknown>) => ({ statusCode: response.statusCode, ...body })),
    )
  }
}

@Catch(HttpException)
export class AuthExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<HttpResponse>()
    const statusCode = exception.getStatus()
    const body = exception.getResponse()

    response.status(statusCode).json(
      typeof body === 'string'
        ? { statusCode, message: body }
        : { statusCode, ...body },
    )
  }
}

// src/common/interceptors/bigint.interceptor.ts
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable()
export class BigIntInterceptor implements NestInterceptor {
  intercept(_: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next
      .handle()
      .pipe(
        map((data) =>
          JSON.parse(
            JSON.stringify(data, (_, value) =>
              typeof value === "bigint" ? value.toString() : value,
            ),
          ),
        ),
      );
  }
}

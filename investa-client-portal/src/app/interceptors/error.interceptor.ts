import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ErrorMappingService } from '../services/error-mapping.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private errorMapping = inject(ErrorMappingService);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: any) => {
        if (error && typeof error.fieldErrors !== 'undefined') {
          return throwError(() => error);
        }
        const mapped = this.errorMapping.parseError(error);
        return throwError(() => mapped);
      })
    );
  }
}

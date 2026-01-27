import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, from } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getAccessToken();

    // Proactively refresh if token is expiring soon
    if (token && this.authService.isTokenExpiringSoon()) {
      return from(this.authService.refresh()).pipe(
        switchMap(() => {
          const newToken = this.authService.getAccessToken();
          const authReq = newToken ? req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } }) : req;
          return next.handle(authReq);
        }),
        catchError(err => {
          this.authService.logout();
          return throwError(() => err);
        })
      );
    }

    let authReq = req;
    if (token) {
      authReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    }

    return next.handle(authReq).pipe(
      catchError((err: any) => {
        if (err instanceof HttpErrorResponse && err.status === 401) {
          // Avoid trying to refresh if the 401 came from login/refresh endpoints
          if (req.url.includes('/auth/refresh') || req.url.includes('/auth/login')) {
            this.authService.logout();
            return throwError(() => err);
          }
          return this.handle401Error(authReq, next);
        }
        return throwError(() => err);
      })
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshSubject.next(null);

      return from(this.authService.refresh()).pipe(
        switchMap(() => {
          this.isRefreshing = false;
          const newToken = this.authService.getAccessToken();
          this.refreshSubject.next(newToken);
          const cloned = newToken ? request.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } }) : request;
          return next.handle(cloned);
        }),
        catchError((err) => {
          this.isRefreshing = false;
          this.authService.logout();
          return throwError(() => err);
        })
      );
    } else {
      return this.refreshSubject.pipe(
        filter(t => t != null),
        take(1),
        switchMap((token) => {
          const cloned = token ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : request;
          return next.handle(cloned as HttpRequest<any>);
        })
      );
    }
  }
}

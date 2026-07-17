import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, throwError, from } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import * as i0 from "@angular/core";
import * as i1 from "../services/auth.service";
import * as i2 from "@angular/router";
export class AuthInterceptor {
    constructor(authService, router) {
        this.authService = authService;
        this.router = router;
        this.isRefreshing = false;
        this.refreshSubject = new BehaviorSubject(null);
    }
    intercept(req, next) {
        const authorization = this.authService.getAuthorizationHeaderValue();
        // Proactively refresh if token is expiring soon
        if (authorization && this.authService.isTokenExpiringSoon()) {
            return from(this.authService.refresh()).pipe(switchMap(() => {
                const refreshedAuthorization = this.authService.getAuthorizationHeaderValue();
                const authReq = refreshedAuthorization ? req.clone({ setHeaders: { Authorization: refreshedAuthorization } }) : req;
                return next.handle(authReq);
            }), catchError(err => {
                this.authService.logout();
                return throwError(() => err);
            }));
        }
        let authReq = req;
        if (authorization) {
            authReq = req.clone({ setHeaders: { Authorization: authorization } });
        }
        return next.handle(authReq).pipe(catchError((err) => {
            if (err instanceof HttpErrorResponse && err.status === 401) {
                // Avoid trying to refresh if the 401 came from login/refresh endpoints
                if (req.url.includes('/auth/refresh') || req.url.includes('/auth/login')) {
                    this.authService.logout();
                    try {
                        this.router.navigate(['/']);
                    }
                    catch { }
                    return throwError(() => err);
                }
                return this.handle401Error(authReq, next);
            }
            return throwError(() => err);
        }));
    }
    handle401Error(request, next) {
        if (!this.isRefreshing) {
            this.isRefreshing = true;
            this.refreshSubject.next(null);
            return from(this.authService.refresh()).pipe(switchMap(() => {
                this.isRefreshing = false;
                const refreshedAuthorization = this.authService.getAuthorizationHeaderValue();
                this.refreshSubject.next(refreshedAuthorization);
                const cloned = refreshedAuthorization ? request.clone({ setHeaders: { Authorization: refreshedAuthorization } }) : request;
                return next.handle(cloned);
            }), catchError((err) => {
                this.isRefreshing = false;
                this.authService.logout();
                try {
                    this.router.navigate(['/']);
                }
                catch { }
                return throwError(() => err);
            }));
        }
        else {
            return this.refreshSubject.pipe(filter(t => t != null), take(1), switchMap((authorization) => {
                const cloned = authorization ? request.clone({ setHeaders: { Authorization: authorization } }) : request;
                return next.handle(cloned);
            }));
        }
    }
    static { this.ɵfac = function AuthInterceptor_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AuthInterceptor)(i0.ɵɵinject(i1.AuthService), i0.ɵɵinject(i2.Router)); }; }
    static { this.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: AuthInterceptor, factory: AuthInterceptor.ɵfac }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AuthInterceptor, [{
        type: Injectable
    }], () => [{ type: i1.AuthService }, { type: i2.Router }], null); })();

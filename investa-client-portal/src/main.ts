import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { routes } from './app/app.routes';
import { AuthInterceptor } from './app/interceptors/auth.interceptor';
import { API_BASE } from './app/config/api.token';
import { getApiBase } from './app/config/api.config';

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideHttpClient(),
    provideRouter(routes, withHashLocation()),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    // Make API base configurable at bootstrap time. Override via window.__INVESTA_API_BASE if set.
    { provide: API_BASE, useValue: getApiBase() }
  ]
}).catch(err => console.error(err));

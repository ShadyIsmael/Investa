import { Component, ErrorHandler, Injectable, Injector, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LoggerService } from './core/services/logger.service';

/**
 * Global Error Handler for Angular Application
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private logger = inject(LoggerService);
  private injector = inject(Injector);

  handleError(error: Error | unknown): void {
    const router = this.injector.get(Router);
    
    // Log the error
    this.logger.error('Global error caught:', error);

    // Handle specific error types
    if (error instanceof Error) {
      // Handle specific errors
      if (error.message.includes('ExpressionChangedAfterItHasBeenCheckedError')) {
        // Development-only error, can be ignored in production
        if (!this.isProduction()) {
          console.error('Expression changed error:', error);
        }
        return;
      }

      // Handle HTTP errors (you can extend this)
      if (error.name === 'HttpErrorResponse') {
        this.logger.error('HTTP Error occurred:', error);
        // You might want to show a notification here
      }
    }

    // For critical errors, you might want to redirect to an error page
    // router.navigate(['/error']);
    
    // Re-throw the error to prevent breaking the app
    // Comment this out if you want to suppress errors
    // throw error;
  }

  private isProduction(): boolean {
    // Check if running in production mode
    return false; // Replace with actual environment check
  }
}

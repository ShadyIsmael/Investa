/**
 * Centralized Logger Utility
 * Provides controlled logging with environment-aware output
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isDevelopment = import.meta.env.DEV;

  private shouldLog(level: LogLevel): boolean {
    // In production, only log warnings and errors
    if (!this.isDevelopment && (level === 'debug' || level === 'info')) {
      return false;
    }
    return true;
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  }

  // Specialized loggers for specific domains
  api = {
    request: (method: string, endpoint: string, data?: any) => {
      this.debug(`API ${method} ${endpoint}`, data);
    },
    response: (method: string, endpoint: string, status: number) => {
      this.debug(`API ${method} ${endpoint} → ${status}`);
    },
    error: (method: string, endpoint: string, error: any) => {
      this.error(`API ${method} ${endpoint} failed`, error);
    }
  };


}

export const logger = new Logger();

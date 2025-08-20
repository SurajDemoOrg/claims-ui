/**
 * Logger utility for the Claims UI application
 * Provides structured logging with different levels and contexts
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogContext {
  component?: string;
  action?: string;
  userId?: string;
  claimId?: string;
  correlationId?: string;
  metadata?: Record<string, any>;
}

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  context?: LogContext;
  error?: Error;
  data?: any;
}

class Logger {
  private minLevel: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = import.meta.env.DEV;
    this.minLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.minLevel;
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext, error?: Error, data?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level: LogLevel[level],
      message,
      context,
      error,
      data,
    };
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error, data?: any): void {
    if (!this.shouldLog(level)) return;

    const logEntry = this.formatMessage(level, message, context, error, data);
    
    // In development, use enhanced console logging
    if (this.isDevelopment) {
      const consoleMethod = this.getConsoleMethod(level);
      const formattedMessage = this.formatForConsole(logEntry);
      
      if (error) {
        consoleMethod(formattedMessage, error);
      } else if (data) {
        consoleMethod(formattedMessage, data);
      } else {
        consoleMethod(formattedMessage);
      }
    } else {
      // In production, use structured logging
      console.log(JSON.stringify(logEntry));
    }

    // Store logs in sessionStorage for debugging (keep last 100 entries)
    this.storeLog(logEntry);
  }

  private getConsoleMethod(level: LogLevel): typeof console.log {
    switch (level) {
      case LogLevel.DEBUG:
        return console.debug;
      case LogLevel.INFO:
        return console.info;
      case LogLevel.WARN:
        return console.warn;
      case LogLevel.ERROR:
        return console.error;
      default:
        return console.log;
    }
  }

  private formatForConsole(entry: LogEntry): string {
    const parts = [
      `[${entry.timestamp}]`,
      `[${entry.level}]`,
    ];

    if (entry.context?.component) {
      parts.push(`[${entry.context.component}]`);
    }

    if (entry.context?.action) {
      parts.push(`[${entry.context.action}]`);
    }

    if (entry.context?.claimId) {
      parts.push(`[Claim:${entry.context.claimId}]`);
    }

    parts.push(entry.message);

    return parts.join(' ');
  }

  private storeLog(entry: LogEntry): void {
    try {
      const logs = JSON.parse(sessionStorage.getItem('app_logs') || '[]');
      logs.push(entry);
      
      // Keep only the last 100 logs
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      sessionStorage.setItem('app_logs', JSON.stringify(logs));
    } catch (error) {
      // Silently fail if sessionStorage is not available
    }
  }

  // Public logging methods
  debug(message: string, context?: LogContext, data?: any): void {
    this.log(LogLevel.DEBUG, message, context, undefined, data);
  }

  info(message: string, context?: LogContext, data?: any): void {
    this.log(LogLevel.INFO, message, context, undefined, data);
  }

  warn(message: string, context?: LogContext, data?: any): void {
    this.log(LogLevel.WARN, message, context, undefined, data);
  }

  error(message: string, context?: LogContext, error?: Error, data?: any): void {
    this.log(LogLevel.ERROR, message, context, error, data);
  }

  // API-specific logging methods
  apiRequest(method: string, url: string, context?: LogContext, data?: any): void {
    this.info(`API Request: ${method} ${url}`, {
      ...context,
      action: 'api_request',
      metadata: { method, url }
    }, data);
  }

  apiResponse(method: string, url: string, status: number, duration: number, context?: LogContext, data?: any): void {
    const level = status >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    this.log(level, `API Response: ${method} ${url} - ${status} (${duration}ms)`, {
      ...context,
      action: 'api_response',
      metadata: { method, url, status, duration }
    }, undefined, data);
  }

  apiError(method: string, url: string, error: Error, context?: LogContext): void {
    this.error(`API Error: ${method} ${url}`, {
      ...context,
      action: 'api_error',
      metadata: { method, url }
    }, error);
  }

  // User action logging
  userAction(action: string, context?: LogContext, data?: any): void {
    this.info(`User Action: ${action}`, {
      ...context,
      action: 'user_action',
      metadata: { userAction: action }
    }, data);
  }

  // Performance logging
  performance(operation: string, duration: number, context?: LogContext): void {
    const level = duration > 1000 ? LogLevel.WARN : LogLevel.INFO;
    this.log(level, `Performance: ${operation} took ${duration}ms`, {
      ...context,
      action: 'performance',
      metadata: { operation, duration }
    });
  }

  // Component lifecycle logging
  componentMount(componentName: string, context?: LogContext): void {
    this.debug(`Component mounted: ${componentName}`, {
      ...context,
      component: componentName,
      action: 'component_mount'
    });
  }

  componentUnmount(componentName: string, context?: LogContext): void {
    this.debug(`Component unmounted: ${componentName}`, {
      ...context,
      component: componentName,
      action: 'component_unmount'
    });
  }

  // Get stored logs for debugging
  getLogs(): LogEntry[] {
    try {
      return JSON.parse(sessionStorage.getItem('app_logs') || '[]');
    } catch {
      return [];
    }
  }

  // Clear stored logs
  clearLogs(): void {
    try {
      sessionStorage.removeItem('app_logs');
    } catch {
      // Silently fail if sessionStorage is not available
    }
  }
}

// Export singleton instance
export const logger = new Logger();

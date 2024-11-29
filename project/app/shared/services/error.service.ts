import { Observable } from '@nativescript/core';
import { NotificationService } from './notification.service';

export interface AppError {
  code: string;
  message: string;
  timestamp: Date;
  data?: any;
}

export class ErrorService extends Observable {
  private static instance: ErrorService;
  private notificationService: NotificationService;
  private errors: AppError[] = [];

  private constructor() {
    super();
    this.notificationService = NotificationService.getInstance();
  }

  public static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService();
    }
    return ErrorService.instance;
  }

  public handleError(error: any): void {
    const appError: AppError = {
      code: error.code || 'UNKNOWN_ERROR',
      message: error.message || 'An unknown error occurred',
      timestamp: new Date(),
      data: error.data
    };

    this.errors.push(appError);
    this.notifyPropertyChange('lastError', appError);

    // Show error notification to user
    this.notificationService.sendLocalNotification({
      title: 'Error',
      body: appError.message
    });

    // Log error for analytics
    console.error('Application error:', appError);
  }

  public getErrors(): AppError[] {
    return [...this.errors];
  }

  public clearErrors(): void {
    this.errors = [];
    this.notifyPropertyChange('errors', []);
  }

  public async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
        }
      }
    }

    this.handleError(lastError);
    throw lastError;
  }
}
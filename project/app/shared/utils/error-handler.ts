import { ErrorService } from '../services/error.service';

export class ErrorHandler {
    private static errorService = ErrorService.getInstance();

    public static handleError(error: any, context?: string): void {
        const errorDetails = {
            message: error.message || 'Une erreur est survenue',
            code: error.code || 'UNKNOWN_ERROR',
            context,
            timestamp: new Date(),
            stack: error.stack
        };

        console.error('Error details:', errorDetails);
        this.errorService.handleError(errorDetails);
    }

    public static async withErrorHandling<T>(
        operation: () => Promise<T>,
        context?: string
    ): Promise<T> {
        try {
            return await operation();
        } catch (error) {
            this.handleError(error, context);
            throw error;
        }
    }
}

export const withErrorHandling = ErrorHandler.withErrorHandling.bind(ErrorHandler);
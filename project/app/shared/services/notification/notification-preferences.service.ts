import { Observable } from '@nativescript/core';
import { SecureStorage } from '@nativescript/secure-storage';
import { NotificationPreferences } from './notification.model';
import { ErrorService } from '../error.service';

export class NotificationPreferencesService extends Observable {
  private static instance: NotificationPreferencesService;
  private secureStorage: SecureStorage;
  private errorService: ErrorService;
  private readonly STORAGE_KEY = 'notification_preferences';

  private constructor() {
    super();
    this.secureStorage = new SecureStorage();
    this.errorService = ErrorService.getInstance();
  }

  public static getInstance(): NotificationPreferencesService {
    if (!NotificationPreferencesService.instance) {
      NotificationPreferencesService.instance = new NotificationPreferencesService();
    }
    return NotificationPreferencesService.instance;
  }

  public async getPreferences(): Promise<NotificationPreferences> {
    try {
      const data = await this.secureStorage.get({ key: this.STORAGE_KEY });
      if (!data) {
        return this.getDefaultPreferences();
      }
      return JSON.parse(data);
    } catch (error) {
      this.errorService.handleError(error);
      return this.getDefaultPreferences();
    }
  }

  public async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<void> {
    try {
      const currentPreferences = await this.getPreferences();
      const updatedPreferences = {
        ...currentPreferences,
        ...preferences
      };

      await this.secureStorage.set({
        key: this.STORAGE_KEY,
        value: JSON.stringify(updatedPreferences)
      });

      this.notify({
        eventName: 'preferencesUpdated',
        object: this,
        data: updatedPreferences
      });
    } catch (error) {
      this.errorService.handleError(error);
      throw error;
    }
  }

  private getDefaultPreferences(): NotificationPreferences {
    return {
      transactions: true,
      priceAlerts: true,
      security: true,
      marketing: false,
      email: true,
      push: true
    };
  }
}
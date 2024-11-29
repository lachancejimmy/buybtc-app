import { Observable } from '@nativescript/core';
import * as firebase from '@nativescript/firebase';
import { ErrorService } from '../error.service';

export interface PushNotificationConfig {
  onMessageReceived?: (message: any) => void;
  onTokenRefresh?: (token: string) => void;
}

export class PushNotificationService extends Observable {
  private static instance: PushNotificationService;
  private errorService: ErrorService;
  private isInitialized: boolean = false;

  private constructor() {
    super();
    this.errorService = ErrorService.getInstance();
  }

  public static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  public async initialize(config: PushNotificationConfig = {}): Promise<void> {
    if (this.isInitialized) return;

    try {
      await firebase.init({
        showNotifications: true,
        showNotificationsWhenInForeground: true,
        onMessageReceived: (message) => {
          this.handleNotification(message);
          config.onMessageReceived?.(message);
        },
        onTokenRefresh: (token) => {
          this.handleTokenRefresh(token);
          config.onTokenRefresh?.(token);
        }
      });

      const token = await firebase.getCurrentPushToken();
      console.log('Firebase token:', token);
      this.isInitialized = true;
    } catch (error) {
      this.errorService.handleError(error);
      throw error;
    }
  }

  private handleNotification(message: any): void {
    console.log('Received notification:', message);
    this.notify({
      eventName: 'notificationReceived',
      object: this,
      data: message
    });
  }

  private handleTokenRefresh(token: string): void {
    console.log('Token refreshed:', token);
    this.notify({
      eventName: 'tokenRefreshed',
      object: this,
      data: token
    });
  }

  public async requestPermission(): Promise<boolean> {
    try {
      return await firebase.requestPermission();
    } catch (error) {
      this.errorService.handleError(error);
      return false;
    }
  }

  public async subscribeToTopic(topic: string): Promise<void> {
    try {
      await firebase.subscribeToTopic(topic);
    } catch (error) {
      this.errorService.handleError(error);
      throw error;
    }
  }

  public async unsubscribeFromTopic(topic: string): Promise<void> {
    try {
      await firebase.unsubscribeFromTopic(topic);
    } catch (error) {
      this.errorService.handleError(error);
      throw error;
    }
  }

  public async sendNotification(title: string, body: string, data?: any): Promise<void> {
    try {
      await firebase.scheduleLocalNotification({
        title,
        body,
        data,
        channel: 'default',
        schedule: {
          exact: true
        }
      });
    } catch (error) {
      this.errorService.handleError(error);
      throw error;
    }
  }
}
import { Observable } from '@nativescript/core';
import * as firebase from '@nativescript/firebase';

export interface PushNotification {
  title: string;
  body: string;
  data?: { [key: string]: any };
}

export class NotificationService extends Observable {
  private static instance: NotificationService;

  private constructor() {
    super();
    this.initialize();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async initialize() {
    try {
      await firebase.init({
        showNotifications: true,
        showNotificationsWhenInForeground: true,
        onMessageReceived: (message) => this.handleNotification(message)
      });

      const token = await firebase.getCurrentPushToken();
      console.log('Firebase token:', token);
    } catch (error) {
      console.error('Failed to initialize Firebase:', error);
    }
  }

  private handleNotification(message: any) {
    console.log('Received notification:', message);
    this.notifyPropertyChange('lastNotification', {
      title: message.title,
      body: message.body,
      data: message.data
    });
  }

  public async requestPermission(): Promise<boolean> {
    try {
      const result = await firebase.requestPermission();
      return result;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }

  public async sendLocalNotification(notification: PushNotification): Promise<void> {
    try {
      await firebase.scheduleLocalNotification({
        title: notification.title,
        body: notification.body,
        data: notification.data,
        channel: 'default',
        schedule: {
          exact: true
        }
      });
    } catch (error) {
      console.error('Failed to send local notification:', error);
    }
  }

  public async cancelAllNotifications(): Promise<void> {
    try {
      await firebase.cancelAllLocalNotifications();
    } catch (error) {
      console.error('Failed to cancel notifications:', error);
    }
  }

  public async subscribeToTopic(topic: string): Promise<void> {
    try {
      await firebase.subscribeToTopic(topic);
    } catch (error) {
      console.error(`Failed to subscribe to topic ${topic}:`, error);
    }
  }

  public async unsubscribeFromTopic(topic: string): Promise<void> {
    try {
      await firebase.unsubscribeFromTopic(topic);
    } catch (error) {
      console.error(`Failed to unsubscribe from topic ${topic}:`, error);
    }
  }
}
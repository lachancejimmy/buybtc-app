import { Observable } from '@nativescript/core';
import * as firebase from '@nativescript/firebase';
import { LocalNotifications } from '@nativescript/local-notifications';
import { ErrorService } from './error.service';

export interface PushNotification {
    title: string;
    body: string;
    data?: { [key: string]: any };
}

export class PushNotificationService extends Observable {
    private static instance: PushNotificationService;
    private errorService: ErrorService;
    private isInitialized: boolean = false;

    private constructor() {
        super();
        this.errorService = ErrorService.getInstance();
        this.initialize();
    }

    public static getInstance(): PushNotificationService {
        if (!PushNotificationService.instance) {
            PushNotificationService.instance = new PushNotificationService();
        }
        return PushNotificationService.instance;
    }

    private async initialize() {
        try {
            await firebase.init({
                showNotifications: true,
                showNotificationsWhenInForeground: true,
                onMessageReceived: this.handleNotification.bind(this)
            });

            await LocalNotifications.requestPermission();

            const token = await firebase.getCurrentPushToken();
            console.log('Firebase token:', token);

            this.isInitialized = true;
        } catch (error) {
            this.errorService.handleError(error);
        }
    }

    private handleNotification(message: any) {
        this.notify({
            eventName: Observable.propertyChangeEvent,
            object: this,
            propertyName: 'notification',
            value: {
                title: message.title,
                body: message.body,
                data: message.data
            }
        });
    }

    public async sendLocalNotification(notification: PushNotification): Promise<void> {
        try {
            await LocalNotifications.schedule([{
                title: notification.title,
                body: notification.body,
                at: new Date(),
                forceShowWhenInForeground: true
            }]);
        } catch (error) {
            this.errorService.handleError(error);
        }
    }

    public async subscribeToTopic(topic: string): Promise<void> {
        try {
            await firebase.subscribeToTopic(topic);
        } catch (error) {
            this.errorService.handleError(error);
        }
    }

    public async unsubscribeFromTopic(topic: string): Promise<void> {
        try {
            await firebase.unsubscribeFromTopic(topic);
        } catch (error) {
            this.errorService.handleError(error);
        }
    }

    public async clearAllNotifications(): Promise<void> {
        try {
            await LocalNotifications.cancel();
        } catch (error) {
            this.errorService.handleError(error);
        }
    }

    public isReady(): boolean {
        return this.isInitialized;
    }
}
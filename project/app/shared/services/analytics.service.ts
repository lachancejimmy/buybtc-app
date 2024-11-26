import { Observable } from '@nativescript/core';
import * as firebase from '@nativescript/firebase';

export interface AnalyticsEvent {
  name: string;
  params?: { [key: string]: any };
  timestamp: Date;
}

export class AnalyticsService extends Observable {
  private static instance: AnalyticsService;
  private events: AnalyticsEvent[] = [];

  private constructor() {
    super();
  }

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  public async trackEvent(name: string, params?: { [key: string]: any }): Promise<void> {
    const event: AnalyticsEvent = {
      name,
      params,
      timestamp: new Date()
    };

    this.events.push(event);

    try {
      await firebase.analytics.logEvent({
        key: name,
        parameters: params
      });
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  public async trackScreen(screenName: string): Promise<void> {
    try {
      await firebase.analytics.setScreenName({
        screenName
      });
    } catch (error) {
      console.error('Failed to track screen:', error);
    }
  }

  public getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  public clearEvents(): void {
    this.events = [];
  }
}
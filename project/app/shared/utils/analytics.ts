import { AnalyticsService } from '../services/analytics.service';

export enum AnalyticsEvent {
    USER_LOGIN = 'user_login',
    USER_SIGNUP = 'user_signup',
    BUY_BITCOIN = 'buy_bitcoin',
    SELL_BITCOIN = 'sell_bitcoin',
    ROUNDUP_ENABLED = 'roundup_enabled',
    ROUNDUP_DISABLED = 'roundup_disabled',
    KYC_STARTED = 'kyc_started',
    KYC_COMPLETED = 'kyc_completed',
    BANK_LINKED = 'bank_linked',
    TRANSACTION_COMPLETED = 'transaction_completed'
}

class Analytics {
    private static analyticsService = AnalyticsService.getInstance();

    public static trackEvent(event: AnalyticsEvent, params?: Record<string, any>): void {
        this.analyticsService.trackEvent(event, {
            timestamp: new Date().toISOString(),
            ...params
        });
    }

    public static trackScreen(screenName: string): void {
        this.analyticsService.trackScreen(screenName);
    }
}

export const analytics = Analytics;
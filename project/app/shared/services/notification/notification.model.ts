export interface Notification {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  data?: any;
  read: boolean;
  timestamp: Date;
}

export enum NotificationType {
  TRANSACTION = 'transaction',
  PRICE_ALERT = 'price_alert',
  SECURITY = 'security',
  SYSTEM = 'system',
  MARKETING = 'marketing'
}

export interface NotificationPreferences {
  transactions: boolean;
  priceAlerts: boolean;
  security: boolean;
  marketing: boolean;
  email: boolean;
  push: boolean;
}
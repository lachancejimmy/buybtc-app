import { Observable } from '@nativescript/core';
import { ExchangeService } from './exchange.service';
import { ErrorService } from './error.service';
import { NotificationService } from './notification.service';

export interface RecurringPurchase {
  id: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  nextExecutionDate: Date;
  status: 'active' | 'paused' | 'cancelled';
  lastExecutionDate?: Date;
}

export class RecurringService extends Observable {
  private static instance: RecurringService;
  private exchangeService: ExchangeService;
  private errorService: ErrorService;
  private notificationService: NotificationService;
  private recurringPurchases: Map<string, RecurringPurchase> = new Map();

  private constructor() {
    super();
    this.exchangeService = ExchangeService.getInstance();
    this.errorService = ErrorService.getInstance();
    this.notificationService = NotificationService.getInstance();
    this.initializeRecurringChecks();
  }

  public static getInstance(): RecurringService {
    if (!RecurringService.instance) {
      RecurringService.instance = new RecurringService();
    }
    return RecurringService.instance;
  }

  private initializeRecurringChecks() {
    setInterval(() => this.checkAndExecuteRecurringPurchases(), 60000); // Check every minute
  }

  private async checkAndExecuteRecurringPurchases() {
    const now = new Date();
    for (const [id, purchase] of this.recurringPurchases) {
      if (purchase.status !== 'active') continue;
      if (purchase.nextExecutionDate <= now) {
        await this.executePurchase(purchase);
      }
    }
  }

  private async executePurchase(purchase: RecurringPurchase) {
    try {
      await this.exchangeService.placeBuyOrder(purchase.amount, 0); // Market order
      
      const updatedPurchase = {
        ...purchase,
        lastExecutionDate: new Date(),
        nextExecutionDate: this.calculateNextExecutionDate(purchase.frequency)
      };
      
      this.recurringPurchases.set(purchase.id, updatedPurchase);
      this.notifyPropertyChange('recurringPurchases', Array.from(this.recurringPurchases.values()));

      this.notificationService.sendLocalNotification({
        title: 'Recurring Purchase Executed',
        body: `Successfully purchased ${purchase.amount} CAD of Bitcoin`
      });
    } catch (error) {
      this.errorService.handleError(error);
    }
  }

  private calculateNextExecutionDate(frequency: 'daily' | 'weekly' | 'monthly'): Date {
    const date = new Date();
    switch (frequency) {
      case 'daily':
        date.setDate(date.getDate() + 1);
        break;
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
    }
    return date;
  }

  public async createRecurringPurchase(
    amount: number,
    frequency: 'daily' | 'weekly' | 'monthly'
  ): Promise<RecurringPurchase> {
    const purchase: RecurringPurchase = {
      id: Date.now().toString(),
      amount,
      frequency,
      nextExecutionDate: this.calculateNextExecutionDate(frequency),
      status: 'active'
    };

    this.recurringPurchases.set(purchase.id, purchase);
    this.notifyPropertyChange('recurringPurchases', Array.from(this.recurringPurchases.values()));

    return purchase;
  }

  public async updateRecurringPurchase(
    id: string,
    updates: Partial<RecurringPurchase>
  ): Promise<RecurringPurchase | null> {
    const purchase = this.recurringPurchases.get(id);
    if (!purchase) return null;

    const updatedPurchase = {
      ...purchase,
      ...updates,
      nextExecutionDate: updates.frequency ? 
        this.calculateNextExecutionDate(updates.frequency) : 
        purchase.nextExecutionDate
    };

    this.recurringPurchases.set(id, updatedPurchase);
    this.notifyPropertyChange('recurringPurchases', Array.from(this.recurringPurchases.values()));

    return updatedPurchase;
  }

  public async cancelRecurringPurchase(id: string): Promise<boolean> {
    const purchase = this.recurringPurchases.get(id);
    if (!purchase) return false;

    const updatedPurchase = {
      ...purchase,
      status: 'cancelled' as const
    };

    this.recurringPurchases.set(id, updatedPurchase);
    this.notifyPropertyChange('recurringPurchases', Array.from(this.recurringPurchases.values()));

    return true;
  }

  public getRecurringPurchases(): RecurringPurchase[] {
    return Array.from(this.recurringPurchases.values());
  }
}
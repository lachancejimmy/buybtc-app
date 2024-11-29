import { Observable } from '@nativescript/core';
import axios from 'axios';
import { CacheService } from '../cache.service';
import { ErrorService } from '../error.service';

export interface BitcoinPrice {
  CAD: number;
  USD: number;
  EUR: number;
  timestamp: Date;
}

export class BitcoinPriceService extends Observable {
  private static instance: BitcoinPriceService;
  private cacheService: CacheService;
  private errorService: ErrorService;
  private readonly CACHE_KEY = 'bitcoin_price';
  private readonly CACHE_DURATION = 60000; // 1 minute

  private constructor() {
    super();
    this.cacheService = CacheService.getInstance();
    this.errorService = ErrorService.getInstance();
  }

  public static getInstance(): BitcoinPriceService {
    if (!BitcoinPriceService.instance) {
      BitcoinPriceService.instance = new BitcoinPriceService();
    }
    return BitcoinPriceService.instance;
  }

  public async getCurrentPrice(): Promise<BitcoinPrice> {
    try {
      // Try to get cached price first
      const cachedPrice = await this.cacheService.get<BitcoinPrice>(this.CACHE_KEY);
      if (cachedPrice) {
        return cachedPrice;
      }

      const response = await axios.get('https://api.coinbase.com/v2/prices/BTC-CAD/spot');
      const cadPrice = parseFloat(response.data.data.amount);

      // Get USD and EUR prices
      const [usdResponse, eurResponse] = await Promise.all([
        axios.get('https://api.coinbase.com/v2/prices/BTC-USD/spot'),
        axios.get('https://api.coinbase.com/v2/prices/BTC-EUR/spot')
      ]);

      const price: BitcoinPrice = {
        CAD: cadPrice,
        USD: parseFloat(usdResponse.data.data.amount),
        EUR: parseFloat(eurResponse.data.data.amount),
        timestamp: new Date()
      };

      // Cache the price
      await this.cacheService.set(this.CACHE_KEY, price, this.CACHE_DURATION);

      this.notifyPropertyChange('currentPrice', price);
      return price;
    } catch (error) {
      this.errorService.handleError(error);
      throw error;
    }
  }

  public async getPriceHistory(days: number = 30): Promise<Array<{ date: Date; price: number }>> {
    try {
      const response = await axios.get(
        `https://api.coinbase.com/v2/prices/BTC-CAD/historic?days=${days}`
      );

      return response.data.data.prices.map(item => ({
        date: new Date(item.time),
        price: parseFloat(item.price)
      }));
    } catch (error) {
      this.errorService.handleError(error);
      throw error;
    }
  }

  public async setupPriceAlert(targetPrice: number): Promise<void> {
    // Implement price alert logic
    // This would typically involve setting up a background task or websocket connection
    // to monitor the price and trigger notifications when the target is reached
  }
}
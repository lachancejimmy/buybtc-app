import { Observable } from '@nativescript/core';
import axios from 'axios';
import { BitcoinService } from './crypto/bitcoin.service';
import { ErrorService } from './error.service';

export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  timestamp: Date;
}

export interface OrderBook {
  bids: [number, number][]; // [price, amount]
  asks: [number, number][]; // [price, amount]
  timestamp: Date;
}

export interface Trade {
  id: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  total: number;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
}

export class ExchangeService extends Observable {
  private static instance: ExchangeService;
  private readonly API_URL = 'https://api.exchange.com/v1';
  private readonly API_KEY = 'your-exchange-api-key';
  private bitcoinService: BitcoinService;
  private errorService: ErrorService;

  private constructor() {
    super();
    this.bitcoinService = BitcoinService.getInstance();
    this.errorService = ErrorService.getInstance();
  }

  public static getInstance(): ExchangeService {
    if (!ExchangeService.instance) {
      ExchangeService.instance = new ExchangeService();
    }
    return ExchangeService.instance;
  }

  public async getExchangeRate(from: string, to: string): Promise<ExchangeRate> {
    try {
      const response = await axios.get(
        `${this.API_URL}/rates/${from}/${to}`,
        {
          headers: { 'Authorization': `Bearer ${this.API_KEY}` }
        }
      );

      return {
        from,
        to,
        rate: response.data.rate,
        timestamp: new Date(response.data.timestamp)
      };
    } catch (error) {
      this.errorService.handleError(error);
      throw error;
    }
  }

  public async getOrderBook(pair: string = 'BTC-CAD'): Promise<OrderBook> {
    try {
      const response = await axios.get(
        `${this.API_URL}/orderbook/${pair}`,
        {
          headers: { 'Authorization': `Bearer ${this.API_KEY}` }
        }
      );

      return {
        bids: response.data.bids,
        asks: response.data.asks,
        timestamp: new Date(response.data.timestamp)
      };
    } catch (error) {
      this.errorService.handleError(error);
      throw error;
    }
  }

  public async placeBuyOrder(amount: number, price: number): Promise<Trade> {
    try {
      const response = await axios.post(
        `${this.API_URL}/orders`,
        {
          type: 'buy',
          amount,
          price,
          pair: 'BTC-CAD'
        },
        {
          headers: { 'Authorization': `Bearer ${this.API_KEY}` }
        }
      );

      return {
        id: response.data.id,
        type: 'buy',
        amount,
        price,
        total: amount * price,
        timestamp: new Date(),
        status: response.data.status
      };
    } catch (error) {
      this.errorService.handleError(error);
      throw error;
    }
  }

  public async placeSellOrder(amount: number, price: number): Promise<Trade> {
    try {
      const response = await axios.post(
        `${this.API_URL}/orders`,
        {
          type: 'sell',
          amount,
          price,
          pair: 'BTC-CAD'
        },
        {
          headers: { 'Authorization': `Bearer ${this.API_KEY}` }
        }
      );

      return {
        id: response.data.id,
        type: 'sell',
        amount,
        price,
        total: amount * price,
        timestamp: new Date(),
        status: response.data.status
      };
    } catch (error) {
      this.errorService.handleError(error);
      throw error;
    }
  }

  public async getTradeHistory(): Promise<Trade[]> {
    try {
      const response = await axios.get(
        `${this.API_URL}/trades`,
        {
          headers: { 'Authorization': `Bearer ${this.API_KEY}` }
        }
      );

      return response.data.trades.map((trade: any) => ({
        id: trade.id,
        type: trade.type,
        amount: trade.amount,
        price: trade.price,
        total: trade.amount * trade.price,
        timestamp: new Date(trade.timestamp),
        status: trade.status
      }));
    } catch (error) {
      this.errorService.handleError(error);
      throw error;
    }
  }

  public async cancelOrder(orderId: string): Promise<boolean> {
    try {
      await axios.delete(
        `${this.API_URL}/orders/${orderId}`,
        {
          headers: { 'Authorization': `Bearer ${this.API_KEY}` }
        }
      );
      return true;
    } catch (error) {
      this.errorService.handleError(error);
      return false;
    }
  }
}
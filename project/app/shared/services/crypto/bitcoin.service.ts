import { Observable } from '@nativescript/core';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import { SecureStorage } from '@nativescript/secure-storage';
import * as CryptoJS from 'crypto-js';

export interface BitcoinPrice {
  USD: number;
  CAD: number;
  EUR: number;
}

export interface BitcoinTransaction {
  txid: string;
  amount: number;
  confirmations: number;
  timestamp: Date;
  type: 'send' | 'receive';
  address: string;
  fee?: number;
}

export class BitcoinService extends Observable {
  private static instance: BitcoinService;
  private secureStorage: SecureStorage;
  private readonly API_URL = 'https://api.coinbase.com/v2';
  private readonly WEBSOCKET_URL = 'wss://ws.coinbase.com';
  private ws: WebSocket | null = null;

  private constructor() {
    super();
    this.secureStorage = new SecureStorage();
    this.initializeWebSocket();
  }

  public static getInstance(): BitcoinService {
    if (!BitcoinService.instance) {
      BitcoinService.instance = new BitcoinService();
    }
    return BitcoinService.instance;
  }

  private initializeWebSocket() {
    this.ws = new WebSocket(this.WEBSOCKET_URL);
    
    this.ws.onopen = () => {
      if (this.ws) {
        this.ws.send(JSON.stringify({
          type: 'subscribe',
          channels: ['ticker'],
          product_ids: ['BTC-CAD']
        }));
      }
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'ticker') {
        this.notifyPropertyChange('currentPrice', parseFloat(data.price));
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      setTimeout(() => this.initializeWebSocket(), 5000);
    };
  }

  public async getCurrentPrice(): Promise<BitcoinPrice> {
    try {
      const response = await axios.get(`${this.API_URL}/prices/BTC-CAD/spot`);
      return {
        CAD: parseFloat(response.data.data.amount),
        USD: await this.convertCADtoUSD(parseFloat(response.data.data.amount)),
        EUR: await this.convertCADtoEUR(parseFloat(response.data.data.amount))
      };
    } catch (error) {
      console.error('Failed to fetch Bitcoin price:', error);
      throw error;
    }
  }

  private async convertCADtoUSD(cadAmount: number): Promise<number> {
    try {
      const response = await axios.get(`${this.API_URL}/exchange-rates`);
      const rate = response.data.data.rates.USD / response.data.data.rates.CAD;
      return cadAmount * rate;
    } catch (error) {
      console.error('Failed to convert CAD to USD:', error);
      throw error;
    }
  }

  private async convertCADtoEUR(cadAmount: number): Promise<number> {
    try {
      const response = await axios.get(`${this.API_URL}/exchange-rates`);
      const rate = response.data.data.rates.EUR / response.data.data.rates.CAD;
      return cadAmount * rate;
    } catch (error) {
      console.error('Failed to convert CAD to EUR:', error);
      throw error;
    }
  }

  public async createWallet(): Promise<{ address: string; privateKey: string }> {
    try {
      const response = await axios.post(`${this.API_URL}/accounts`, {
        name: 'Bitstack Wallet'
      });

      const wallet = {
        address: response.data.data.address,
        privateKey: response.data.data.private_key
      };

      // Encrypt private key before storing
      const encryptedPrivateKey = CryptoJS.AES.encrypt(
        wallet.privateKey,
        'your-secure-key'
      ).toString();

      await this.secureStorage.set({
        key: 'wallet_private_key',
        value: encryptedPrivateKey
      });

      await this.secureStorage.set({
        key: 'wallet_address',
        value: wallet.address
      });

      return wallet;
    } catch (error) {
      console.error('Failed to create wallet:', error);
      throw error;
    }
  }

  public async getTransactions(): Promise<BitcoinTransaction[]> {
    try {
      const address = await this.secureStorage.get({ key: 'wallet_address' });
      if (!address) throw new Error('No wallet address found');

      const response = await axios.get(`${this.API_URL}/accounts/${address}/transactions`);
      
      return response.data.data.map((tx: any) => ({
        txid: tx.id,
        amount: parseFloat(tx.amount.amount),
        confirmations: tx.confirmations,
        timestamp: new Date(tx.created_at),
        type: tx.type,
        address: tx.address,
        fee: tx.network_fee ? parseFloat(tx.network_fee.amount) : undefined
      }));
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      throw error;
    }
  }

  public async sendBitcoin(toAddress: string, amount: number): Promise<string> {
    try {
      const address = await this.secureStorage.get({ key: 'wallet_address' });
      if (!address) throw new Error('No wallet address found');

      const response = await axios.post(`${this.API_URL}/accounts/${address}/transactions`, {
        to: toAddress,
        amount: amount.toString(),
        currency: 'BTC'
      });

      return response.data.data.id;
    } catch (error) {
      console.error('Failed to send Bitcoin:', error);
      throw error;
    }
  }

  public async getBalance(): Promise<{ BTC: number; CAD: number }> {
    try {
      const address = await this.secureStorage.get({ key: 'wallet_address' });
      if (!address) throw new Error('No wallet address found');

      const response = await axios.get(`${this.API_URL}/accounts/${address}`);
      const btcBalance = parseFloat(response.data.data.balance.amount);
      const price = await this.getCurrentPrice();

      return {
        BTC: btcBalance,
        CAD: btcBalance * price.CAD
      };
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      throw error;
    }
  }

  public validateAddress(address: string): boolean {
    // Basic Bitcoin address validation
    return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address);
  }

  public async backupWallet(): Promise<string> {
    try {
      const privateKeyEncrypted = await this.secureStorage.get({ key: 'wallet_private_key' });
      if (!privateKeyEncrypted) throw new Error('No wallet found');

      const privateKey = CryptoJS.AES.decrypt(
        privateKeyEncrypted,
        'your-secure-key'
      ).toString(CryptoJS.enc.Utf8);

      return privateKey;
    } catch (error) {
      console.error('Failed to backup wallet:', error);
      throw error;
    }
  }

  public async restoreWallet(privateKey: string): Promise<boolean> {
    try {
      const encryptedPrivateKey = CryptoJS.AES.encrypt(
        privateKey,
        'your-secure-key'
      ).toString();

      await this.secureStorage.set({
        key: 'wallet_private_key',
        value: encryptedPrivateKey
      });

      // Derive and store public address
      const response = await axios.post(`${this.API_URL}/accounts/import`, {
        private_key: privateKey
      });

      await this.secureStorage.set({
        key: 'wallet_address',
        value: response.data.data.address
      });

      return true;
    } catch (error) {
      console.error('Failed to restore wallet:', error);
      throw error;
    }
  }
}
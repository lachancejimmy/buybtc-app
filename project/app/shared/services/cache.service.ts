import { Observable } from '@nativescript/core';
import { SecureStorage } from '@nativescript/secure-storage';

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

export class CacheService extends Observable {
  private static instance: CacheService;
  private secureStorage: SecureStorage;
  private readonly DEFAULT_EXPIRATION = 1800000; // 30 minutes

  private constructor() {
    super();
    this.secureStorage = new SecureStorage();
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  public async set<T>(key: string, data: T, expiresIn: number = this.DEFAULT_EXPIRATION): Promise<void> {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiresIn
    };

    await this.secureStorage.set({
      key,
      value: JSON.stringify(item)
    });
  }

  public async get<T>(key: string): Promise<T | null> {
    try {
      const result = await this.secureStorage.get({ key });
      if (!result) return null;

      const item: CacheItem<T> = JSON.parse(result);
      if (Date.now() - item.timestamp > item.expiresIn) {
        await this.remove(key);
        return null;
      }

      return item.data;
    } catch {
      return null;
    }
  }

  public async remove(key: string): Promise<void> {
    await this.secureStorage.remove({ key });
  }

  public async clear(): Promise<void> {
    // Clear all cached data
    const keys = await this.secureStorage.getAllKeys();
    for (const key of keys) {
      await this.secureStorage.remove({ key });
    }
  }
}
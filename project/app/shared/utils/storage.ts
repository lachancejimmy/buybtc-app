import { SecureStorage } from '@nativescript/secure-storage';

class StorageService {
    private static instance: StorageService;
    private secureStorage: SecureStorage;

    private constructor() {
        this.secureStorage = new SecureStorage();
    }

    public static getInstance(): StorageService {
        if (!StorageService.instance) {
            StorageService.instance = new StorageService();
        }
        return StorageService.instance;
    }

    public async setSecure(key: string, value: string): Promise<void> {
        await this.secureStorage.set({
            key,
            value
        });
    }

    public async getSecure(key: string): Promise<string | null> {
        try {
            return await this.secureStorage.get({ key });
        } catch {
            return null;
        }
    }

    public async removeSecure(key: string): Promise<void> {
        await this.secureStorage.remove({ key });
    }

    public async clearSecure(): Promise<void> {
        const keys = await this.secureStorage.getAllKeys();
        for (const key of keys) {
            await this.removeSecure(key);
        }
    }
}

export const storageService = StorageService.getInstance();
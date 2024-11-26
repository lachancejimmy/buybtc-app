import { Observable } from '@nativescript/core';
import axios from 'axios';
import { ErrorService } from './error.service';
import { NotificationService } from './notification.service';
import { SecureStorage } from '@nativescript/secure-storage';

export interface KYCDocument {
    type: 'passport' | 'driving_license' | 'national_id';
    front: string;
    back?: string;
}

export interface PersonalInfo {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    address: string;
    city: string;
    country: string;
    postalCode: string;
    phoneNumber: string;
    email: string;
}

export interface KYCStatus {
    status: 'pending' | 'approved' | 'rejected';
    level: 1 | 2 | 3;
    lastUpdate: Date;
    reason?: string;
}

export class KYCService extends Observable {
    private static instance: KYCService;
    private readonly API_URL = 'https://api.kyc-provider.com/v1';
    private readonly API_KEY = process.env.KYC_API_KEY;
    private errorService: ErrorService;
    private notificationService: NotificationService;
    private secureStorage: SecureStorage;

    private constructor() {
        super();
        this.errorService = ErrorService.getInstance();
        this.notificationService = NotificationService.getInstance();
        this.secureStorage = new SecureStorage();
    }

    public static getInstance(): KYCService {
        if (!KYCService.instance) {
            KYCService.instance = new KYCService();
        }
        return KYCService.instance;
    }

    public async submitVerification(
        userId: string,
        personalInfo: PersonalInfo,
        document: KYCDocument
    ): Promise<KYCStatus> {
        try {
            const response = await axios.post(
                `${this.API_URL}/verifications`,
                {
                    userId,
                    personalInfo,
                    document
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const status: KYCStatus = {
                status: response.data.status,
                level: response.data.level,
                lastUpdate: new Date(),
                reason: response.data.reason
            };

            await this.secureStorage.set({
                key: `kyc_status_${userId}`,
                value: JSON.stringify(status)
            });

            this.notificationService.sendLocalNotification({
                title: 'Vérification KYC',
                body: 'Votre demande de vérification a été soumise avec succès'
            });

            return status;
        } catch (error) {
            this.errorService.handleError(error);
            throw error;
        }
    }

    public async uploadDocument(file: string, type: 'front' | 'back'): Promise<string> {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', type);

            const response = await axios.post(
                `${this.API_URL}/documents/upload`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${this.API_KEY}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            return response.data.documentId;
        } catch (error) {
            this.errorService.handleError(error);
            throw error;
        }
    }

    public async getVerificationStatus(userId: string): Promise<KYCStatus> {
        try {
            // Check cached status first
            const cachedStatus = await this.secureStorage.get({
                key: `kyc_status_${userId}`
            });

            if (cachedStatus) {
                return JSON.parse(cachedStatus);
            }

            const response = await axios.get(
                `${this.API_URL}/verifications/${userId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.API_KEY}`
                    }
                }
            );

            const status: KYCStatus = {
                status: response.data.status,
                level: response.data.level,
                lastUpdate: new Date(response.data.lastUpdate),
                reason: response.data.reason
            };

            await this.secureStorage.set({
                key: `kyc_status_${userId}`,
                value: JSON.stringify(status)
            });

            return status;
        } catch (error) {
            this.errorService.handleError(error);
            throw error;
        }
    }

    public async updatePersonalInfo(
        userId: string,
        updates: Partial<PersonalInfo>
    ): Promise<boolean> {
        try {
            await axios.patch(
                `${this.API_URL}/users/${userId}/personal-info`,
                updates,
                {
                    headers: {
                        'Authorization': `Bearer ${this.API_KEY}`
                    }
                }
            );
            return true;
        } catch (error) {
            this.errorService.handleError(error);
            return false;
        }
    }

    public async cancelVerification(userId: string): Promise<boolean> {
        try {
            await axios.delete(
                `${this.API_URL}/verifications/${userId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.API_KEY}`
                    }
                }
            );
            
            await this.secureStorage.remove({
                key: `kyc_status_${userId}`
            });
            
            return true;
        } catch (error) {
            this.errorService.handleError(error);
            return false;
        }
    }
}
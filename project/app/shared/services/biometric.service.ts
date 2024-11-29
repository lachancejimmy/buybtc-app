import { Observable } from '@nativescript/core';
import { FingerprintAuth, BiometricIDAvailableResult } from '@nativescript/fingerprint-auth';

export class BiometricService extends Observable {
    private static instance: BiometricService;
    private fingerprintAuth: FingerprintAuth;

    private constructor() {
        super();
        this.fingerprintAuth = new FingerprintAuth();
    }

    public static getInstance(): BiometricService {
        if (!BiometricService.instance) {
            BiometricService.instance = new BiometricService();
        }
        return BiometricService.instance;
    }

    public async isBiometricAvailable(): Promise<boolean> {
        try {
            const result = await this.fingerprintAuth.available();
            return result.biometrics !== 'none';
        } catch (error) {
            console.error('Biometric check failed:', error);
            return false;
        }
    }

    public async authenticate(message: string = 'Veuillez vous authentifier'): Promise<boolean> {
        try {
            const result = await this.fingerprintAuth.verifyFingerprint({
                message,
                title: 'Authentification biométrique'
            });
            return result === 'biometric_success';
        } catch (error) {
            console.error('Authentication failed:', error);
            return false;
        }
    }
}
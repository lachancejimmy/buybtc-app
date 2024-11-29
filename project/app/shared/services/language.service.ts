import { Observable } from '@nativescript/core';
import { translations } from '../i18n/translations';

export class LanguageService extends Observable {
    private static instance: LanguageService;
    private _currentLanguage: 'fr' | 'en' = 'fr';

    private constructor() {
        super();
    }

    public static getInstance(): LanguageService {
        if (!LanguageService.instance) {
            LanguageService.instance = new LanguageService();
        }
        return LanguageService.instance;
    }

    get currentLanguage(): 'fr' | 'en' {
        return this._currentLanguage;
    }

    public setLanguage(language: 'fr' | 'en'): void {
        this._currentLanguage = language;
        this.notifyPropertyChange('currentLanguage', language);
    }

    public translate(key: string): string {
        const keys = key.split('.');
        let value: any = translations[this._currentLanguage];
        
        for (const k of keys) {
            if (value[k] === undefined) {
                return key;
            }
            value = value[k];
        }
        
        return String(value);
    }
}
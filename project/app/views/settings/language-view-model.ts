import { Observable } from '@nativescript/core';
import { LanguageService } from '../../shared/services/language.service';

export class LanguageViewModel extends Observable {
    private languageService: LanguageService;
    private _isFrench: boolean;

    constructor() {
        super();
        this.languageService = LanguageService.getInstance();
        this._isFrench = this.languageService.currentLanguage === 'fr';
    }

    get isFrench(): boolean {
        return this._isFrench;
    }

    toggleLanguage() {
        this._isFrench = !this._isFrench;
        this.languageService.setLanguage(this._isFrench ? 'fr' : 'en');
        this.notifyPropertyChange('isFrench', this._isFrench);
    }
}
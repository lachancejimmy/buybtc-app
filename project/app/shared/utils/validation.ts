export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
    return password.length >= 8 && 
           /[A-Z]/.test(password) && 
           /[a-z]/.test(password) && 
           /[0-9]/.test(password);
};

export const validateBitcoinAddress = (address: string): boolean => {
    const regex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/;
    return regex.test(address);
};

export const validateAmount = (amount: number): boolean => {
    return !isNaN(amount) && amount > 0 && Number.isFinite(amount);
};

export const formatCurrency = (amount: number, currency: string = 'CAD'): string => {
    return new Intl.NumberFormat('fr-CA', {
        style: 'currency',
        currency
    }).format(amount);
};

export const formatBTC = (amount: number): string => {
    return `${amount.toFixed(8)} BTC`;
};

export const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('fr-CA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
};
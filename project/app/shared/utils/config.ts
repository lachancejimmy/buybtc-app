export const CONFIG = {
    API: {
        BASE_URL: 'https://api.bitstack.com/v1',
        TIMEOUT: 30000,
        RETRY_ATTEMPTS: 3
    },
    BITCOIN: {
        MIN_AMOUNT: 0.00001,
        MAX_AMOUNT: 1,
        NETWORK: 'mainnet',
        DEFAULT_FEE_LEVEL: 'medium'
    },
    ROUNDUP: {
        MIN_THRESHOLD: 0.01,
        MAX_THRESHOLD: 1000
    },
    KYC: {
        REQUIRED_LEVEL: 2,
        DOCUMENT_TYPES: ['passport', 'driving_license', 'national_id'],
        MAX_FILE_SIZE: 5 * 1024 * 1024 // 5MB
    },
    CACHE: {
        PRICE_TTL: 60000, // 1 minute
        BALANCE_TTL: 300000, // 5 minutes
        TRANSACTIONS_TTL: 300000 // 5 minutes
    },
    BIOMETRIC: {
        TIMEOUT: 30000,
        ALLOWED_ATTEMPTS: 3
    }
};
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { CONFIG } from './config';
import { storageService } from './storage';
import { ErrorHandler } from './error-handler';

class ApiClient {
    private static instance: ApiClient;
    private axiosInstance: AxiosInstance;

    private constructor() {
        this.axiosInstance = axios.create({
            baseURL: CONFIG.API.BASE_URL,
            timeout: CONFIG.API.TIMEOUT,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        this.setupInterceptors();
    }

    public static getInstance(): ApiClient {
        if (!ApiClient.instance) {
            ApiClient.instance = new ApiClient();
        }
        return ApiClient.instance;
    }

    private setupInterceptors(): void {
        this.axiosInstance.interceptors.request.use(
            async (config) => {
                const token = await storageService.getSecure('auth_token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        this.axiosInstance.interceptors.response.use(
            (response) => response,
            async (error) => {
                if (error.response?.status === 401) {
                    await storageService.removeSecure('auth_token');
                    // Redirect to login
                }
                return Promise.reject(error);
            }
        );
    }

    public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        return ErrorHandler.withErrorHandling(async () => {
            const response = await this.axiosInstance.get<T>(url, config);
            return response.data;
        }, `GET ${url}`);
    }

    public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        return ErrorHandler.withErrorHandling(async () => {
            const response = await this.axiosInstance.post<T>(url, data, config);
            return response.data;
        }, `POST ${url}`);
    }

    public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        return ErrorHandler.withErrorHandling(async () => {
            const response = await this.axiosInstance.put<T>(url, data, config);
            return response.data;
        }, `PUT ${url}`);
    }

    public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        return ErrorHandler.withErrorHandling(async () => {
            const response = await this.axiosInstance.delete<T>(url, config);
            return response.data;
        }, `DELETE ${url}`);
    }
}

export const apiClient = ApiClient.getInstance();
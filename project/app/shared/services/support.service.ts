import { Observable } from '@nativescript/core';
import axios from 'axios';

export interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
  messages: SupportMessage[];
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  content: string;
  sender: 'user' | 'support';
  timestamp: Date;
  attachments?: string[];
}

export class SupportService extends Observable {
  private static instance: SupportService;
  private readonly API_URL = 'https://api.support-system.com/v1';
  private readonly API_KEY = 'your-support-api-key';

  private constructor() {
    super();
  }

  public static getInstance(): SupportService {
    if (!SupportService.instance) {
      SupportService.instance = new SupportService();
    }
    return SupportService.instance;
  }

  public async createTicket(
    userId: string,
    subject: string,
    description: string,
    priority: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<SupportTicket> {
    try {
      const response = await axios.post(
        `${this.API_URL}/tickets`,
        {
          userId,
          subject,
          description,
          priority
        },
        {
          headers: {
            'Authorization': `Bearer ${this.API_KEY}`
          }
        }
      );

      return this.formatTicket(response.data);
    } catch (error) {
      console.error('Failed to create support ticket:', error);
      throw error;
    }
  }

  public async getTickets(userId: string): Promise<SupportTicket[]> {
    try {
      const response = await axios.get(
        `${this.API_URL}/tickets?userId=${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.API_KEY}`
          }
        }
      );

      return response.data.map(this.formatTicket);
    } catch (error) {
      console.error('Failed to fetch support tickets:', error);
      throw error;
    }
  }

  public async addMessage(
    ticketId: string,
    content: string,
    attachments?: string[]
  ): Promise<SupportMessage> {
    try {
      const response = await axios.post(
        `${this.API_URL}/tickets/${ticketId}/messages`,
        {
          content,
          attachments
        },
        {
          headers: {
            'Authorization': `Bearer ${this.API_KEY}`
          }
        }
      );

      return this.formatMessage(response.data);
    } catch (error) {
      console.error('Failed to add message:', error);
      throw error;
    }
  }

  private formatTicket(data: any): SupportTicket {
    return {
      id: data.id,
      subject: data.subject,
      description: data.description,
      status: data.status,
      priority: data.priority,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      messages: data.messages.map(this.formatMessage)
    };
  }

  private formatMessage(data: any): SupportMessage {
    return {
      id: data.id,
      ticketId: data.ticket_id,
      content: data.content,
      sender: data.sender,
      timestamp: new Date(data.timestamp),
      attachments: data.attachments
    };
  }
}
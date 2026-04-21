/**
 * Chat API service
 */

import axios, { AxiosResponse } from 'axios';
import {
  Message,
  Conversation,
  SendMessageRequest,
  SendMessageResponse,
  RegenerateMessageRequest,
  CreateConversationRequest,
  UpdateConversationRequest,
  GetMessagesRequest,
  GetMessagesResponse,
  SearchConversationsRequest,
  SearchConversationsResponse,
  ChatStats,
} from '@/lib/types/chat';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance with base configuration
const chatApi = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
chatApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401 responses
chatApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(
            `${API_BASE_URL}/api/auth/refresh`,
            { refresh_token: refreshToken },
            { headers: { 'Content-Type': 'application/json' } }
          );

          const tokens = response.data;
          localStorage.setItem('accessToken', tokens.access_token);
          localStorage.setItem('refreshToken', tokens.refresh_token);

          originalRequest.headers.Authorization = `Bearer ${tokens.access_token}`;
          return chatApi(originalRequest);
        } else {
          throw new Error('No refresh token');
        }
      } catch (refreshError) {
        window.dispatchEvent(new CustomEvent('auth:session_expired'));
      }
    }

    return Promise.reject(error);
  }
);

// Backend response shapes (snake_case from FastAPI/Pydantic)
interface BackendConversation {
  id: string;
  user_id: string;
  title: string | null;
  description: string | null;
  model: string;
  provider: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  message_count?: number;
  last_message?: BackendMessage;
}

interface BackendMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  meta?: Record<string, any> | null;
  metadata?: Record<string, any> | null;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
}

interface BackendSendMessageResponse {
  user_message: BackendMessage;
  assistant_message: BackendMessage;
  cache_hit: boolean;
  response_time_ms: number;
}

function mapConversation(c: BackendConversation): Conversation {
  return {
    id: c.id,
    title: c.title ?? 'New Conversation',
    userId: c.user_id,
    createdAt: new Date(c.created_at),
    updatedAt: new Date(c.updated_at),
    messageCount: c.message_count ?? 0,
    lastMessage: c.last_message ? mapMessage(c.last_message) : undefined,
    isArchived: c.is_archived,
    settings: {
      model: c.model,
      provider: (c.provider as 'openai' | 'gemini') ?? 'gemini',
    },
  };
}

function mapMessage(m: BackendMessage): Message {
  const meta = m.meta || m.metadata || {};
  return {
    id: m.id,
    conversationId: m.conversation_id,
    content: m.content,
    role: m.role,
    timestamp: new Date(m.created_at),
    status: 'sent',
    metadata: {
      model: meta.model,
      provider: meta.provider,
      tokens: meta.tokens_used,
      cost: meta.cost,
      cacheHit: meta.cache_hit,
      responseTime: meta.response_time_ms,
    },
  };
}

export class ChatApiService {
  // Conversation management
  async getConversations(
    page = 1,
    limit = 20,
    _search?: string
  ): Promise<{ conversations: Conversation[]; total: number; hasMore: boolean }> {
    const offset = (Math.max(page, 1) - 1) * limit;
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    const response: AxiosResponse<{
      conversations: BackendConversation[];
      total: number;
    }> = await chatApi.get(`/conversations?${params}`);

    const conversations = response.data.conversations.map(mapConversation);
    const total = response.data.total;
    return {
      conversations,
      total,
      hasMore: offset + conversations.length < total,
    };
  }

  async getConversation(id: string): Promise<Conversation> {
    const response: AxiosResponse<BackendConversation> = await chatApi.get(
      `/conversations/${id}`
    );
    return mapConversation(response.data);
  }

  async createConversation(data: CreateConversationRequest): Promise<Conversation> {
    const payload: Record<string, unknown> = {};
    if (data.title) payload.title = data.title;
    if (data.settings?.model) payload.model = data.settings.model;
    if (data.settings?.provider) payload.provider = data.settings.provider;

    const response: AxiosResponse<BackendConversation> = await chatApi.post(
      '/conversations',
      payload
    );
    return mapConversation(response.data);
  }

  async updateConversation(data: UpdateConversationRequest): Promise<Conversation> {
    const payload: Record<string, unknown> = {};
    if (data.title !== undefined) payload.title = data.title;
    if (data.isArchived !== undefined) payload.is_archived = data.isArchived;

    const response: AxiosResponse<BackendConversation> = await chatApi.patch(
      `/conversations/${data.id}`,
      payload
    );
    return mapConversation(response.data);
  }

  async deleteConversation(id: string): Promise<void> {
    await chatApi.delete(`/conversations/${id}`);
  }

  async searchConversations(data: SearchConversationsRequest): Promise<SearchConversationsResponse> {
    const response: AxiosResponse<SearchConversationsResponse> = await chatApi.post(
      '/conversations/search',
      data
    );
    return response.data;
  }

  // Message management
  async getMessages(data: GetMessagesRequest): Promise<GetMessagesResponse> {
    const page = data.page || 1;
    const limit = data.limit || 50;
    const offset = (Math.max(page, 1) - 1) * limit;
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    const response: AxiosResponse<{
      messages: BackendMessage[];
      total: number;
    }> = await chatApi.get(
      `/conversations/${data.conversationId}/messages?${params}`
    );

    const messages = response.data.messages.map(mapMessage);
    const total = response.data.total;
    return {
      messages,
      total,
      page,
      limit,
      hasMore: offset + messages.length < total,
    };
  }

  async sendMessage(data: SendMessageRequest): Promise<SendMessageResponse> {
    // Backend requires an existing conversation; auto-create one if absent.
    let conversationId = data.conversationId;
    let conversation: Conversation | undefined;
    if (!conversationId) {
      conversation = await this.createConversation({
        title: data.content.slice(0, 60) || 'New Conversation',
        settings: data.settings as any,
      });
      conversationId = conversation.id;
    }

    const payload: Record<string, unknown> = { content: data.content };
    if (data.settings?.model) payload.model = data.settings.model;
    if (data.settings?.provider) payload.provider = data.settings.provider;

    const response: AxiosResponse<BackendSendMessageResponse> = await chatApi.post(
      `/conversations/${conversationId}/messages`,
      payload
    );

    const userMessage = mapMessage(response.data.user_message);
    const assistantMessage = mapMessage(response.data.assistant_message);

    if (!conversation) {
      conversation = await this.getConversation(conversationId);
    }

    return {
      message: assistantMessage,
      conversation,
      cacheHit: response.data.cache_hit,
      responseTime: response.data.response_time_ms,
      cost: (assistantMessage.metadata?.cost as number) ?? 0,
      userMessage,
      assistantMessage,
    };
  }

  async regenerateMessage(data: RegenerateMessageRequest): Promise<SendMessageResponse> {
    const response: AxiosResponse<{
      user_message: BackendMessage;
      assistant_message: BackendMessage;
      cache_hit: boolean;
      response_time_ms: number;
    }> = await chatApi.post(
      `/messages/${data.messageId}/regenerate`,
      { settings: data.settings }
    );

    const assistantMessage = mapMessage(response.data.assistant_message);
    return {
      message: assistantMessage,
      assistantMessage,
      cacheHit: response.data.cache_hit,
      responseTime: response.data.response_time_ms,
      cost: assistantMessage.metadata?.cost ?? 0,
    };
  }

  async deleteMessage(id: string): Promise<void> {
    await chatApi.delete(`/messages/${id}`);
  }

  // Utility functions
  async exportConversation(id: string, format: 'json' | 'markdown' | 'txt' = 'json'): Promise<Blob> {
    const response = await chatApi.get(`/conversations/${id}/export`, {
      params: { format },
      responseType: 'blob',
    });
    
    return response.data;
  }

  async getChatStats(): Promise<ChatStats> {
    const response: AxiosResponse<ChatStats> = await chatApi.get('/stats');
    return response.data;
  }

  // WebSocket connection for real-time updates
  createWebSocketConnection(conversationId?: string): WebSocket {
    const token = localStorage.getItem('accessToken');
    const wsUrl = `${API_BASE_URL.replace('http', 'ws')}/ws/chat`;
    const params = new URLSearchParams();
    
    if (token) params.append('token', token);
    if (conversationId) params.append('conversation_id', conversationId);
    
    return new WebSocket(`${wsUrl}?${params}`);
  }

  // File upload for attachments
  async uploadFile(file: File): Promise<{ id: string; url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response: AxiosResponse<{ id: string; url: string }> = await chatApi.post(
      '/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    return response.data;
  }
}

// Export singleton instance
export const chatApiService = new ChatApiService();

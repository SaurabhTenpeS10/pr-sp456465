/**
 * Chat-related type definitions
 */

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'error';
  metadata?: {
    model?: string;
    provider?: 'openai' | 'gemini';
    tokens?: number;
    cost?: number;
    cacheHit?: boolean;
    cacheKey?: string;
    responseTime?: number;
    similarity?: number;
  };
  attachments?: Attachment[];
  error?: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date;
}

export interface Conversation {
  id: string;
  title: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
  lastMessage?: Message;
  settings?: ConversationSettings;
  tags?: string[];
  isArchived?: boolean;
}

export interface ConversationSettings {
  model: string;
  provider: 'openai' | 'gemini';
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  cacheEnabled?: boolean;
  cacheTtl?: number;
  similarityThreshold?: number;
}

export interface ChatState {
  conversations: Conversation[];
  currentConversationId: string | null;
  messages: Record<string, Message[]>;
  isLoading: boolean;
  isTyping: boolean;
  error: string | null;
  hasMore: boolean;
  searchQuery: string;
  selectedMessages: string[];
}

export interface SendMessageRequest {
  conversationId?: string;
  content: string;
  attachments?: File[];
  settings?: Partial<ConversationSettings>;
}

export interface SendMessageResponse {
  message: Message;
  conversation?: Conversation;
  cacheHit: boolean;
  responseTime: number;
  cost: number;
  // Present when the backend returns both the persisted user message and
  // the assistant reply in a single round-trip.
  userMessage?: Message;
  assistantMessage?: Message;
}

export interface RegenerateMessageRequest {
  messageId: string;
  settings?: Partial<ConversationSettings>;
}

export interface CreateConversationRequest {
  title?: string;
  settings?: ConversationSettings;
}

export interface UpdateConversationRequest {
  id: string;
  title?: string;
  settings?: Partial<ConversationSettings>;
  tags?: string[];
  isArchived?: boolean;
}

export interface GetMessagesRequest {
  conversationId: string;
  page?: number;
  limit?: number;
  before?: string;
  after?: string;
}

export interface GetMessagesResponse {
  messages: Message[];
  hasMore: boolean;
  total: number;
  page: number;
  limit: number;
}

export interface SearchConversationsRequest {
  query: string;
  tags?: string[];
  isArchived?: boolean;
  limit?: number;
  offset?: number;
}

export interface SearchConversationsResponse {
  conversations: Conversation[];
  total: number;
  hasMore: boolean;
}

export interface ChatStats {
  totalConversations: number;
  totalMessages: number;
  cacheHitRate: number;
  totalCostSaved: number;
  averageResponseTime: number;
  topModels: Array<{
    model: string;
    provider: string;
    usage: number;
  }>;
}

export interface TypingIndicator {
  conversationId: string;
  isTyping: boolean;
  timestamp: Date;
}

// WebSocket event types
export interface WebSocketMessage {
  type: 'message' | 'typing' | 'error' | 'status';
  data: any;
  conversationId?: string;
  timestamp: Date;
}

export interface MessageEvent extends WebSocketMessage {
  type: 'message';
  data: Message;
}

export interface TypingEvent extends WebSocketMessage {
  type: 'typing';
  data: TypingIndicator;
}

export interface ErrorEvent extends WebSocketMessage {
  type: 'error';
  data: {
    message: string;
    code?: string;
    details?: any;
  };
}

export interface StatusEvent extends WebSocketMessage {
  type: 'status';
  data: {
    status: 'connected' | 'disconnected' | 'reconnecting';
    timestamp: Date;
  };
}

// Form types
export interface MessageFormData {
  content: string;
  attachments?: FileList;
}

export interface ConversationFormData {
  title: string;
  settings?: ConversationSettings;
}

// API Error types
export interface ChatApiError {
  message: string;
  code: string;
  details?: {
    field?: string;
    value?: any;
    constraint?: string;
  };
}

// Utility types
export type MessageRole = Message['role'];
export type MessageStatus = Message['status'];
export type LLMProvider = ConversationSettings['provider'];
export type ChatEventType = WebSocketMessage['type'];

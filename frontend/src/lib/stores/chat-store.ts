/**
 * Chat state management with Zustand
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { toast } from 'react-hot-toast';
import {
  ChatState,
  Message,
  Conversation,
  SendMessageRequest,
  CreateConversationRequest,
  UpdateConversationRequest,
  ConversationSettings,
} from '@/lib/types/chat';
import { chatApiService } from '@/lib/api/chat';

interface ChatActions {
  // Conversation actions
  loadConversations: () => Promise<void>;
  createConversation: (data?: CreateConversationRequest) => Promise<string>;
  selectConversation: (id: string) => Promise<void>;
  updateConversation: (data: UpdateConversationRequest) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  searchConversations: (query: string) => void;
  
  // Message actions
  loadMessages: (conversationId: string, page?: number) => Promise<void>;
  sendMessage: (data: SendMessageRequest) => Promise<void>;
  regenerateMessage: (messageId: string, settings?: Partial<ConversationSettings>) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  copyMessage: (content: string) => Promise<void>;
  
  // UI state actions
  setTyping: (isTyping: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  selectMessages: (messageIds: string[]) => void;
  clearSelectedMessages: () => void;
  
  // WebSocket actions
  connectWebSocket: (conversationId?: string) => void;
  disconnectWebSocket: () => void;
}

interface ChatStore extends ChatState, ChatActions {
  ws: WebSocket | null;
}

const initialState: ChatState = {
  conversations: [],
  currentConversationId: null,
  messages: {},
  isLoading: false,
  isTyping: false,
  error: null,
  hasMore: false,
  searchQuery: '',
  selectedMessages: [],
};

export const useChatStore = create<ChatStore>()(
  devtools(
    (set, get) => ({
      ...initialState,
      ws: null,

      // Conversation actions
      loadConversations: async () => {
        try {
          set({ isLoading: true, error: null });
          const response = await chatApiService.getConversations();
          set({
            conversations: response.conversations,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to load conversations',
            isLoading: false,
          });
          toast.error('Failed to load conversations');
        }
      },

      createConversation: async (data = {}) => {
        try {
          set({ isLoading: true, error: null });
          const conversation = await chatApiService.createConversation(data);
          
          set((state) => ({
            conversations: [conversation, ...state.conversations],
            currentConversationId: conversation.id,
            messages: {
              ...state.messages,
              [conversation.id]: [],
            },
            isLoading: false,
          }));
          
          return conversation.id;
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to create conversation',
            isLoading: false,
          });
          toast.error('Failed to create conversation');
          throw error;
        }
      },

      selectConversation: async (id: string) => {
        try {
          set({ currentConversationId: id, error: null });
          
          // Load messages if not already loaded
          const state = get();
          if (!state.messages[id]) {
            await get().loadMessages(id);
          }
          
          // Connect WebSocket for real-time updates
          get().connectWebSocket(id);
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to select conversation' });
          toast.error('Failed to load conversation');
        }
      },

      updateConversation: async (data: UpdateConversationRequest) => {
        try {
          const updatedConversation = await chatApiService.updateConversation(data);
          
          set((state) => ({
            conversations: state.conversations.map((conv) =>
              conv.id === data.id ? updatedConversation : conv
            ),
          }));
          
          toast.success('Conversation updated');
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to update conversation' });
          toast.error('Failed to update conversation');
        }
      },

      deleteConversation: async (id: string) => {
        try {
          await chatApiService.deleteConversation(id);
          
          set((state) => ({
            conversations: state.conversations.filter((conv) => conv.id !== id),
            currentConversationId: state.currentConversationId === id ? null : state.currentConversationId,
            messages: Object.fromEntries(
              Object.entries(state.messages).filter(([key]) => key !== id)
            ),
          }));
          
          toast.success('Conversation deleted');
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to delete conversation' });
          toast.error('Failed to delete conversation');
        }
      },

      searchConversations: (query: string) => {
        set({ searchQuery: query });
      },

      // Message actions
      loadMessages: async (conversationId: string, page = 1) => {
        try {
          set({ isLoading: true, error: null });
          const response = await chatApiService.getMessages({
            conversationId,
            page,
            limit: 50,
          });
          
          set((state) => ({
            messages: {
              ...state.messages,
              [conversationId]: page === 1 
                ? response.messages 
                : [...(state.messages[conversationId] || []), ...response.messages],
            },
            hasMore: response.hasMore,
            isLoading: false,
          }));
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to load messages',
            isLoading: false,
          });
          toast.error('Failed to load messages');
        }
      },

      sendMessage: async (data: SendMessageRequest) => {
        try {
          set({ isTyping: true, error: null });
          
          // Create optimistic message
          const optimisticMessage: Message = {
            id: `temp-${Date.now()}`,
            conversationId: data.conversationId || '',
            content: data.content,
            role: 'user',
            timestamp: new Date(),
            status: 'sending',
          };
          
          // Add optimistic message to state
          const conversationId = data.conversationId || get().currentConversationId;
          if (conversationId) {
            set((state) => ({
              messages: {
                ...state.messages,
                [conversationId]: [...(state.messages[conversationId] || []), optimisticMessage],
              },
            }));
          }
          
          const response = await chatApiService.sendMessage(data);

          const convId = response.conversation.id;
          const userMsg = response.userMessage ?? response.message;
          const assistantMsg = response.assistantMessage ?? response.message;

          set((state) => {
            const existing = (state.messages[convId] || []).filter(
              (msg) => msg.id !== optimisticMessage.id
            );
            return {
              messages: {
                ...state.messages,
                [convId]: [...existing, userMsg, assistantMsg],
              },
              currentConversationId: convId,
              isTyping: false,
            };
          });

          // Update conversation in list
          set((state) => ({
            conversations: state.conversations.some((conv) => conv.id === convId)
              ? state.conversations.map((conv) =>
                  conv.id === convId ? response.conversation : conv
                )
              : [response.conversation, ...state.conversations],
          }));

        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to send message',
            isTyping: false,
          });
          toast.error('Failed to send message');
        }
      },

      regenerateMessage: async (messageId: string, settings?: Partial<ConversationSettings>) => {
        try {
          set({ isTyping: true, error: null });
          const response = await chatApiService.regenerateMessage({ messageId, settings });
          const updatedMessage = response.assistantMessage ?? response.message;
          const conversationId = updatedMessage.conversationId;

          set((state) => ({
            messages: {
              ...state.messages,
              [conversationId]: state.messages[conversationId]?.map((msg) =>
                msg.id === messageId ? updatedMessage : msg
              ) || [],
            },
            conversations: state.conversations.map((conv) =>
              conv.id === conversationId
                ? {
                    ...conv,
                    lastMessage:
                      conv.lastMessage?.id === messageId
                        ? updatedMessage
                        : conv.lastMessage,
                  }
                : conv
            ),
            isTyping: false,
          }));

          toast.success('Message regenerated');
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to regenerate message',
            isTyping: false,
          });
          toast.error('Failed to regenerate message');
        }
      },

      deleteMessage: async (messageId: string) => {
        try {
          await chatApiService.deleteMessage(messageId);

          set((state) => {
            const updatedMessages = Object.fromEntries(
              Object.entries(state.messages).map(([convId, messages]) => {
                const index = messages.findIndex((msg) => msg.id === messageId);
                if (index === -1) {
                  return [convId, messages];
                }

                const toRemove = new Set<string>([messageId]);
                const message = messages[index];

                if (message.role === 'assistant') {
                  const previousUserMessage = [...messages]
                    .slice(0, index)
                    .reverse()
                    .find((msg) => msg.role === 'user');
                  if (previousUserMessage) {
                    toRemove.add(previousUserMessage.id);
                  }
                } else if (message.role === 'user') {
                  const nextAssistantMessage = messages
                    .slice(index + 1)
                    .find((msg) => msg.role === 'assistant');
                  if (nextAssistantMessage) {
                    toRemove.add(nextAssistantMessage.id);
                  }
                }

                return [
                  convId,
                  messages.filter((msg) => !toRemove.has(msg.id)),
                ];
              })
            );

            return {
              messages: updatedMessages,
              conversations: state.conversations.map((conv) => {
                const conversationMessages = updatedMessages[conv.id];
                if (!conversationMessages) {
                  return conv;
                }

                const lastAssistantMessage = [...conversationMessages]
                  .reverse()
                  .find((msg) => msg.role === 'assistant');

                return {
                  ...conv,
                  lastMessage: lastAssistantMessage ?? undefined,
                };
              }),
            };
          });

          toast.success('Message deleted');
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to delete message' });
          toast.error('Failed to delete message');
        }
      },

      copyMessage: async (content: string) => {
        try {
          await navigator.clipboard.writeText(content);
          toast.success('Message copied to clipboard');
        } catch (error: any) {
          toast.error('Failed to copy message');
        }
      },

      // UI state actions
      setTyping: (isTyping: boolean) => set({ isTyping }),
      setError: (error: string | null) => set({ error }),
      clearError: () => set({ error: null }),
      selectMessages: (messageIds: string[]) => set({ selectedMessages: messageIds }),
      clearSelectedMessages: () => set({ selectedMessages: [] }),

      // WebSocket actions
      connectWebSocket: (conversationId?: string) => {
        const state = get();
        if (state.ws) {
          state.ws.close();
        }
        
        try {
          const ws = chatApiService.createWebSocketConnection(conversationId);
          
          ws.onopen = () => {
            console.log('WebSocket connected');
          };
          
          ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            switch (data.type) {
              case 'message':
                const message: Message = data.data;
                set((state) => ({
                  messages: {
                    ...state.messages,
                    [message.conversationId]: [
                      ...(state.messages[message.conversationId] || []),
                      message,
                    ],
                  },
                  isTyping: false,
                }));
                break;
                
              case 'typing':
                set({ isTyping: data.data.isTyping });
                break;
                
              case 'error':
                set({ error: data.data.message });
                toast.error(data.data.message);
                break;
            }
          };
          
          ws.onerror = (error) => {
            console.warn('WebSocket error (real-time updates unavailable):', error);
          };

          ws.onclose = () => {
            console.log('WebSocket disconnected');
            set({ ws: null });
          };
          
          set({ ws });
        } catch (error) {
          console.error('Failed to connect WebSocket:', error);
        }
      },

      disconnectWebSocket: () => {
        const state = get();
        if (state.ws) {
          state.ws.close();
          set({ ws: null });
        }
      },
    }),
    {
      name: 'chat-store',
    }
  )
);

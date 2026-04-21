'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageBubble } from './message-bubble';
import { TypingIndicator } from './typing-indicator';
import { MessageInput } from './message-input';
import { useChatStore } from '@/lib/stores/chat-store';
import { cn } from '@/lib/utils';
import { ChevronDown, AlertCircle, Sparkles } from 'lucide-react';

interface ChatInterfaceProps {
  conversationId?: string;
  className?: string;
}

export function ChatInterface({ conversationId, className }: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);

  const {
    messages,
    isTyping,
    isLoading,
    error,
    hasMore,
    loadMessages,
    clearError,
  } = useChatStore();

  const currentMessages = conversationId ? messages[conversationId] || [] : [];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (isNearBottom) {
      scrollToBottom();
    }
  }, [currentMessages, isTyping, isNearBottom]);

  // Load messages when conversation changes
  useEffect(() => {
    if (conversationId && !messages[conversationId]) {
      loadMessages(conversationId);
    }
  }, [conversationId, messages, loadMessages]);

  // Handle scroll events
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      
      setIsNearBottom(distanceFromBottom < 100);
      setShowScrollButton(distanceFromBottom > 200);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: smooth ? 'smooth' : 'auto' 
    });
  };

  const loadMoreMessages = async () => {
    if (!conversationId || !hasMore || isLoading) return;
    
    const currentPage = Math.ceil(currentMessages.length / 50) + 1;
    await loadMessages(conversationId, currentPage);
  };

  if (!conversationId) {
   return (
  <div
    className={cn(
      "flex flex-col h-full bg-gray-50 dark:bg-gray-900",
      className
    )}
  >
    {/* Scrollable content */}
    <div className="flex-1 overflow-y-auto flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Welcome to PromptCache AI
        </h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md">
          Type a message below to start a new conversation.
          Your responses will be intelligently cached to save costs and improve speed.
        </p>
      </div>
    </div>

    {/* Sticky bottom input */}
    <div className="border-t bg-white dark:bg-gray-900 p-3 sticky bottom-0">
      <MessageInput placeholder="Type your first message..." />
    </div>
  </div>
);
  }

  return (
    <div className={cn(
      'relative flex flex-col min-h-0 overflow-hidden bg-gray-50 dark:bg-gray-900',
      className
    )}>
      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
              </div>
              <button
                onClick={clearError}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 min-h-0 overflow-y-auto px-4 py-6 space-y-4 relative"
      >
        {/* Load More Button */}
        {hasMore && currentMessages.length > 0 && (
          <div className="text-center mb-4">
            <button
              onClick={loadMoreMessages}
              disabled={isLoading}
              className="px-4 py-2 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Load more messages'}
            </button>
          </div>
        )}

        {/* Messages */}
        <AnimatePresence>
          {currentMessages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              isLast={index === currentMessages.length - 1}
            />
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        <AnimatePresence>
          {isTyping && <TypingIndicator />}
        </AnimatePresence>

        {/* Empty State */}
        {currentMessages.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center"
          >
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-4">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-8 h-8 text-white"
              >
                💬
              </motion.div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Start the conversation
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md">
              Send your first message to begin. The AI will respond intelligently,
              and similar future queries will be served from cache for faster responses.
            </p>
          </motion.div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to Bottom Button */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => scrollToBottom()}
            className="absolute bottom-20 right-6 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-lg hover:shadow-xl transition-shadow z-10"
          >
            <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Message Input */}
      <div className="sticky bottom-0 z-30 border-t border-gray-200 bg-gray-50/95 backdrop-blur dark:border-gray-700 dark:bg-gray-900/95">
        <MessageInput conversationId={conversationId} />
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Copy, 
  RotateCcw, 
  Trash2, 
  Clock, 
  Zap, 
  CheckCircle, 
  XCircle,
  User,
  Bot,
  Paperclip,
  DollarSign
} from 'lucide-react';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '@/lib/types/chat';
import { useChatStore } from '@/lib/stores/chat-store';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;
  isLast?: boolean;
  showActions?: boolean;
}

export function MessageBubble({ message, isLast = false, showActions = true }: MessageBubbleProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { copyMessage, regenerateMessage, deleteMessage } = useChatStore();

  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  const isError = message.status === 'error';
  const isSending = message.status === 'sending';

  const handleCopy = async () => {
    await copyMessage(message.content);
  };

  const handleRegenerate = async () => {
    await regenerateMessage(message.id);
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteConfirm(false);
    await deleteMessage(message.id);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const formatTimestamp = (timestamp: Date) => {
    return format(new Date(timestamp), 'HH:mm');
  };


  const getStatusIcon = () => {
    switch (message.status) {
      case 'sending':
        return <Clock className="w-3 h-3 animate-spin text-gray-400" />;
      case 'sent':
      case 'delivered':
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'error':
        return <XCircle className="w-3 h-3 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          'flex w-full mb-4',
          isUser ? 'justify-end' : 'justify-start'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
      <div className={cn(
        'flex max-w-[80%] md:max-w-[70%]',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}>
        {/* Avatar */}
        <div className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          isUser 
            ? 'bg-gradient-primary ml-3' 
            : 'bg-gray-200 dark:bg-gray-700 mr-3'
        )}>
          {isUser ? (
            <User className="w-4 h-4 text-white" />
          ) : (
            <Bot className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          )}
        </div>

        {/* Message Content */}
        <div className={cn(
          'flex flex-col',
          isUser ? 'items-end' : 'items-start'
        )}>
          {/* Message Bubble */}
          <div className={cn(
            'relative px-4 py-3 rounded-2xl break-words',
            isUser
              ? 'bg-gradient-primary text-white'
              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700',
            isError && 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20',
            isSending && 'opacity-70'
          )}>
            {/* Message Content */}
            {isAssistant ? (
              <div className="text-sm leading-relaxed">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => <h1 className="text-lg font-bold mb-3 mt-2 first:mt-0 text-gray-900 dark:text-white">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-base font-bold mb-2 mt-3 first:mt-0 text-gray-900 dark:text-white">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-sm font-semibold mb-2 mt-3 first:mt-0 text-gray-900 dark:text-white">{children}</h3>,
                    p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                    strong: ({ children }) => <strong className="font-semibold text-gray-900 dark:text-white">{children}</strong>,
                    em: ({ children }) => <em className="italic">{children}</em>,
                    ul: ({ children }) => <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>,
                    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                    code: ({ children }) => <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>,
                    pre: ({ children }) => <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded my-2 text-xs overflow-x-auto font-mono">{children}</pre>,
                    blockquote: ({ children }) => <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-3 italic text-gray-600 dark:text-gray-400 my-2">{children}</blockquote>,
                    a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 underline">{children}</a>,
                    hr: () => <hr className="my-3 border-gray-200 dark:border-gray-700" />,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </div>
            )}

            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {message.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center space-x-2 p-2 bg-black/10 dark:bg-white/10 rounded-lg"
                  >
                    <Paperclip className="w-4 h-4" />
                    <span className="text-xs truncate">{attachment.name}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Error Message */}
            {isError && message.error && (
              <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                Error: {message.error}
              </div>
            )}

            {/* Message Metrics (Cache, Time, Cost) */}
            {isAssistant && (message.metadata?.cacheHit || message.metadata?.responseTime !== undefined || message.metadata?.cost !== undefined) && (
              <div className="mt-2 flex items-center flex-wrap gap-3">
                {message.metadata?.cacheHit && (
                  <div className="flex items-center space-x-1 text-xs text-green-600 dark:text-green-400">
                    <Zap className="w-3 h-3" />
                    <span>Cache hit</span>
                  </div>
                )}
                
                {message.metadata?.responseTime !== undefined && (
                  <div className="flex items-center space-x-1 text-xs text-blue-500">
                    <Clock className="w-3 h-3" />
                    <span>{message.metadata.responseTime}ms</span>
                  </div>
                )}

                {message.metadata?.cost !== undefined && (
                  <div className="flex items-center space-x-1 text-xs text-purple-500">
                    <DollarSign className="w-3 h-3" />
                    <span>{message.metadata.cost === 0 ? '0.000' : message.metadata.cost}</span>
                  </div>
                )}
              </div>
            )}

            
          </div>

          {/* Message Footer */}
          <div className={cn(
            'flex items-center space-x-2 mt-1 text-xs text-gray-500 dark:text-gray-400',
            isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'
          )}>
            {/* Timestamp */}
            <span>{formatTimestamp(message.timestamp)}</span>

            {/* Status Icon */}
            {getStatusIcon()}

            {/* Model Info */}
            {message.metadata?.model && (
              <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                {message.metadata.model}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          {showActions && isHovered && !isSending && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                'flex items-center space-x-1 mt-2',
                isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'
              )}
            >
              {/* Copy Button */}
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="Copy message"
              >
                <Copy className="w-3 h-3 text-gray-600 dark:text-gray-300" />
              </button>

              {/* Regenerate Button (Assistant only) */}
              {isAssistant && (
                <button
                  onClick={handleRegenerate}
                  className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  title="Regenerate response"
                >
                  <RotateCcw className="w-3 h-3 text-gray-600 dark:text-gray-300" />
                </button>
              )}

              {/* Delete Button */}
              <button
                onClick={handleDelete}
                className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                title="Delete message"
              >
                <Trash2 className="w-3 h-3 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400" />
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-5 shadow-xl dark:border-gray-700 dark:bg-gray-900">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Delete message?
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              This will delete the message and its paired response. Are you sure?
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={handleCancelDelete}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Send, Paperclip, X, FileText, Image, File } from 'lucide-react';
import { useChatStore } from '@/lib/stores/chat-store';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  conversationId?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function MessageInput({ 
  conversationId, 
  placeholder = "Type your message...",
  disabled = false 
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { sendMessage, isTyping, isLoading } = useChatStore();

  const isDisabled = disabled || isTyping || isLoading;

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 200); // Max height of 200px
      textarea.style.height = `${newHeight}px`;
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    adjustTextareaHeight();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async () => {
    if (!message.trim() && attachments.length === 0) return;
    if (isDisabled) return;

    try {
      await sendMessage({
        conversationId,
        content: message.trim(),
        attachments: attachments.length > 0 ? attachments : undefined,
      });
      
      // Reset form
      setMessage('');
      setAttachments([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    setAttachments(prev => [...prev, ...files]);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="w-4 h-4" />;
    } else if (file.type.includes('text') || file.type.includes('document')) {
      return <FileText className="w-4 h-4" />;
    } else {
      return <File className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex-shrink-0 px-4 pb-4 pt-3 bg-white/95 backdrop-blur dark:bg-gray-900/95">
      <div className="mx-auto w-full max-w-4xl">
        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-xl px-3 py-2 border border-gray-200 dark:border-gray-600"
              >
                {getFileIcon(file)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <button
                  onClick={() => removeAttachment(index)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <X className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Input Card */}
        <div
          className={cn(
            'relative flex items-end gap-3 px-4 py-3 rounded-3xl border transition-all duration-200 shadow-xl backdrop-blur-sm',
            isDragging
              ? 'border-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/30 shadow-indigo-200/50 dark:shadow-indigo-900'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-gray-200/80 dark:shadow-black/40'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Accent top border gradient */}
          <div
            className="absolute top-0 left-6 right-6 h-px rounded-full"
            style={{ background: 'linear-gradient(to right, transparent, #6366f1 50%, transparent)' }}
          />

          {/* File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,text/*,.pdf,.doc,.docx"
          />

          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isDisabled}
              className="w-full resize-none border-0 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-0 disabled:opacity-50 disabled:cursor-not-allowed text-sm leading-relaxed"
              rows={1}
              style={{ minHeight: '28px', maxHeight: '200px' }}
            />

            {/* Drag overlay */}
            {isDragging && (
              <div className="absolute inset-0 flex items-center justify-center bg-primary-50 dark:bg-primary-900/20 rounded-xl">
                <p className="text-primary-600 dark:text-primary-400 font-medium text-sm">
                  Drop files here to attach
                </p>
              </div>
            )}
          </div>

          {/* Send Button */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleSend}
            disabled={isDisabled || (!message.trim() && attachments.length === 0)}
            className={cn(
              'flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-2xl transition-all duration-200',
              (message.trim() || attachments.length > 0) && !isDisabled
                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-300/50 dark:shadow-indigo-900 hover:shadow-xl hover:opacity-95'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            )}
            title="Send message (Enter)"
          >
            {isTyping ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </motion.button>
        </div>

        {/* Keyboard Shortcuts Hint */}
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center tracking-wide">
          Press{' '}
          <kbd className="inline-block px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">Enter</kbd>
          {' '}to send,{' '}
          <kbd className="inline-block px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">Shift + Enter</kbd>
          {' '}for new line
        </div>
      </div>
    </div>
  );
}

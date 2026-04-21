'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MoreVertical,
  Edit2,
  Trash2,
  Download,
  FileText,
  MessageSquare,
  Clock,
  Check,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { Conversation } from '@/lib/types/chat';
import { useChatStore } from '@/lib/stores/chat-store';
import { chatApiService } from '@/lib/api/chat';
import { cn, stripMarkdown, escapeHtml, markdownToHtml } from '@/lib/utils';

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: () => void;
}

export function ConversationItem({ conversation, isActive, onSelect }: ConversationItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(conversation.title);
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  
  const editInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const { updateConversation, deleteConversation } = useChatStore();
  const messages = useChatStore((state) => state.messages[conversation.id]);
  
  const responseCount = messages 
    ? messages.filter((m) => m.role === 'assistant').length
    : Math.floor((conversation.messageCount || 0) / 2);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleEditStart = () => {
    setIsEditing(true);
    setShowMenu(false);
  };

  const handleEditSave = async () => {
    if (editTitle.trim() && editTitle !== conversation.title) {
      try {
        await updateConversation({
          id: conversation.id,
          title: editTitle.trim(),
        });
      } catch (error) {
        console.error('Failed to update conversation:', error);
        setEditTitle(conversation.title); // Reset on error
      }
    }
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setEditTitle(conversation.title);
    setIsEditing(false);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditSave();
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  const handleDelete = () => {
    setShowMenu(false);
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    setShowConfirmDelete(false);
    setIsDeleting(true);

    try {
      await deleteConversation(conversation.id);
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmDelete(false);
  };

  const safeFileName = () =>
    (conversation.title || 'conversation')
      .replace(/[^a-z0-9\-_]+/gi, '_')
      .slice(0, 80) || 'conversation';

  const handleExportMarkdown = async () => {
    setShowMenu(false);
    try {
      const { messages } = await chatApiService.getMessages({
        conversationId: conversation.id,
        page: 1,
        limit: 1000,
      });

      const lines: string[] = [];
      lines.push(`# ${conversation.title}`);
      lines.push('');
      lines.push(`_Exported: ${new Date().toISOString()}_`);
      lines.push('');
      for (const m of messages) {
        const who =
          m.role === 'user'
            ? 'User'
            : m.role === 'assistant'
            ? 'Assistant'
            : m.role;
        const ts = new Date(m.timestamp).toLocaleString();
        lines.push(`## ${who} — ${ts}`);
        lines.push('');
        lines.push(m.content);
        lines.push('');
      }

      const blob = new Blob([lines.join('\n')], {
        type: 'text/markdown;charset=utf-8',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${safeFileName()}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Conversation exported as Markdown');
    } catch (error) {
      console.error('Failed to export conversation:', error);
      toast.error('Failed to export conversation');
    }
  };

  const handleExportPdf = async () => {
    setShowMenu(false);
    try {
      const { messages } = await chatApiService.getMessages({
        conversationId: conversation.id,
        page: 1,
        limit: 1000,
      });

      const blocks = messages
        .map((m) => {
          const who =
            m.role === 'user'
              ? 'You'
              : m.role === 'assistant'
              ? 'Assistant'
              : m.role;
          const ts = new Date(m.timestamp).toLocaleString();
          const body =
            m.role === 'assistant'
              ? markdownToHtml(m.content)
              : `<p>${escapeHtml(m.content).replace(/\n/g, '<br/>')}</p>`;
          return `
<section class="msg msg-${m.role}">
  <header>
    <span class="role">${escapeHtml(who)}</span>
    <time>${escapeHtml(ts)}</time>
  </header>
  <div class="body">${body}</div>
</section>`;
        })
        .join('\n');

      const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>${escapeHtml(conversation.title || 'Conversation')}</title>
<style>
  @page { size: A4; margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; color: #111827; line-height: 1.55; font-size: 11pt; margin: 0; }
  h1.title { font-size: 20pt; margin: 0 0 4pt; color: #111827; }
  .meta { color: #6b7280; font-size: 9.5pt; margin-bottom: 16pt; padding-bottom: 10pt; border-bottom: 1px solid #e5e7eb; }
  section.msg { margin: 0 0 14pt; page-break-inside: avoid; }
  section.msg > header { font-size: 9.5pt; color: #6b7280; margin-bottom: 4pt; display: flex; gap: 10pt; align-items: baseline; }
  section.msg > header .role { font-weight: 600; color: #111827; font-size: 10.5pt; }
  section.msg.msg-user .body { background: #f3f4f6; border-radius: 6pt; padding: 8pt 12pt; }
  section.msg.msg-assistant .body { padding: 0 2pt; }
  .body h1 { font-size: 15pt; margin: 10pt 0 6pt; }
  .body h2 { font-size: 13pt; margin: 10pt 0 6pt; }
  .body h3 { font-size: 11.5pt; margin: 9pt 0 5pt; }
  .body h4, .body h5, .body h6 { font-size: 11pt; margin: 8pt 0 4pt; }
  .body p { margin: 0 0 6pt; }
  .body ul, .body ol { margin: 0 0 6pt; padding-left: 22pt; }
  .body li { margin-bottom: 2pt; }
  .body strong { font-weight: 600; color: #111827; }
  .body em { font-style: italic; }
  .body code { background: #f3f4f6; padding: 1pt 4pt; border-radius: 3pt; font-family: "Courier New", monospace; font-size: 9.5pt; }
  .body pre { background: #f3f4f6; padding: 8pt 10pt; border-radius: 4pt; overflow: auto; font-size: 9.5pt; margin: 6pt 0; }
  .body pre code { background: none; padding: 0; }
  .body blockquote { border-left: 3pt solid #d1d5db; margin: 0 0 6pt; padding: 2pt 0 2pt 10pt; color: #4b5563; }
  .body a { color: #1d4ed8; text-decoration: none; }
  .body hr { border: none; border-top: 1px solid #e5e7eb; margin: 10pt 0; }
</style>
</head>
<body>
<h1 class="title">${escapeHtml(conversation.title || 'Conversation')}</h1>
<div class="meta">Exported ${escapeHtml(new Date().toLocaleString())} &middot; ${messages.length} messages</div>
${blocks}
<script>
  window.addEventListener('load', function () {
    setTimeout(function () { window.focus(); window.print(); }, 250);
  });
  window.addEventListener('afterprint', function () { window.close(); });
<\/script>
</body>
</html>`;

      const win = window.open('', '_blank', 'width=900,height=1000');
      if (!win) {
        toast.error('Please allow pop-ups to export as PDF');
        return;
      }
      win.document.open();
      win.document.write(html);
      win.document.close();

      toast.success('Opening print dialog — choose "Save as PDF"');
    } catch (error) {
      console.error('Failed to export conversation as PDF:', error);
      toast.error('Failed to export as PDF');
    }
  };

  const formatLastActivity = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return format(date, 'HH:mm');
    } else if (diffInHours < 24 * 7) {
      return format(date, 'EEE');
    } else {
      return format(date, 'MMM d');
    }
  };

  if (isDeleting) {
    return (
      <motion.div
        initial={{ opacity: 1, height: 'auto' }}
        animate={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="p-3 text-center text-sm text-gray-500 dark:text-gray-400">
          Deleting...
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'relative group p-3 rounded-lg cursor-pointer transition-colors duration-200',
        showMenu && 'z-20',
        isActive
          ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800'
          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
      )}
      onClick={onSelect}
    >
      {/* Main Content */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0 mr-2">
          {/* Title */}
          {isEditing ? (
            <div className="flex items-center space-x-2">
              <input
                ref={editInputRef}
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={handleEditKeyDown}
                onBlur={handleEditSave}
                className="flex-1 text-sm font-medium bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                onClick={(e) => e.stopPropagation()}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditSave();
                }}
                className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
              >
                <Check className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditCancel();
                }}
                className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {conversation.title}
            </h3>
          )}

          {/* Metadata */}
          <div className="flex items-center space-x-2 mt-1">
            <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400" title="Bot responses">
              <MessageSquare className="w-3 h-3" />
              <span>{responseCount}</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
              <Clock className="w-3 h-3" />
              <span>
                {formatLastActivity(
                  conversation.lastMessage
                    ? new Date(conversation.lastMessage.timestamp)
                    : new Date(conversation.updatedAt)
                )}
              </span>
            </div>
          </div>

          {/* Last Message Preview */}
          {conversation.lastMessage && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
              {stripMarkdown(conversation.lastMessage.content)}
            </p>
          )}

          {/* Tags */}
          {conversation.tags && conversation.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {conversation.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="inline-block px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                >
                  {tag}
                </span>
              ))}
              {conversation.tags.length > 2 && (
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  +{conversation.tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Menu Button */}
        <div className="relative" ref={menuRef}>
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className={cn(
              'p-1 rounded transition-colors',
              showMenu || isActive
                ? 'text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            )}
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="absolute right-0 top-8 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-30"
            >
              <div className="py-1">
                <button
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditStart();
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Rename</span>
                </button>
                
                <button
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExportMarkdown();
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Export as Markdown</span>
                </button>

                <button
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExportPdf();
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>Export as PDF</span>
                </button>
                
                <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                
                <button
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {showConfirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Delete Conversation
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to delete this conversation? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCancelDelete}
                  className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

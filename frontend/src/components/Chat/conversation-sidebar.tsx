'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Plus, 
  Filter, 
  Archive, 
  Folder,
  X,
  ChevronDown,
  ChevronRight,
  LogOut,
  Sun,
  Moon
} from 'lucide-react';
import { ConversationItem } from './conversation-item';
import { useChatStore } from '@/lib/stores/chat-store';
import { useAuth } from '@/lib/auth/context';
import { useTheme } from '@/lib/providers/theme-provider';
import { cn } from '@/lib/utils';
import { debounce } from '@/lib/utils';

interface ConversationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function ConversationSidebar({ isOpen, onClose, className }: ConversationSidebarProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const {
    conversations,
    currentConversationId,
    searchQuery,
    isLoading,
    createConversation,
    selectConversation,
    searchConversations,
  } = useChatStore();
  const { setTheme, resolvedTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      onClose();
    }
    router.push('/');
  };

  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'recent' | 'archived'>('all');
  const [groupBy, setGroupBy] = useState<'none' | 'date' | 'tags'>('date');

  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce((query: string) => {
      searchConversations(query);
    }, 300),
    [searchConversations]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setLocalSearchQuery(query);
    debouncedSearch(query);
  };

  const closeSidebarOnMobile = () => {
    if (typeof window === 'undefined') return;
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const handleNewConversation = async () => {
    try {
      const conversationId = await createConversation();
      await selectConversation(conversationId);
      closeSidebarOnMobile();
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const handleConversationSelect = async (conversationId: string) => {
    await selectConversation(conversationId);
    closeSidebarOnMobile();
  };

  // Filter conversations
  const filteredConversations = useMemo(() => {
    let filtered = conversations;

    // Apply search filter
    if (localSearchQuery.trim()) {
      const query = localSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (conv) =>
          conv.title.toLowerCase().includes(query) ||
          conv.lastMessage?.content.toLowerCase().includes(query) ||
          conv.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Apply status filter
    switch (selectedFilter) {
      case 'recent':
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        filtered = filtered.filter((conv) => new Date(conv.updatedAt) > oneWeekAgo);
        break;
      case 'archived':
        filtered = filtered.filter((conv) => conv.isArchived);
        break;
      default:
        filtered = filtered.filter((conv) => !conv.isArchived);
    }

    return filtered;
  }, [conversations, localSearchQuery, selectedFilter]);

  // Group conversations
  const groupedConversations = useMemo(() => {
    if (groupBy === 'none') {
      return { 'All Conversations': filteredConversations };
    }

    if (groupBy === 'date') {
      const groups: Record<string, typeof filteredConversations> = {};
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const oneWeekAgo = new Date(today);
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      filteredConversations.forEach((conv) => {
        const convDate = new Date(conv.updatedAt);
        const convDateOnly = new Date(convDate.getFullYear(), convDate.getMonth(), convDate.getDate());

        if (convDateOnly.getTime() === today.getTime()) {
          groups['Today'] = groups['Today'] || [];
          groups['Today'].push(conv);
        } else if (convDateOnly.getTime() === yesterday.getTime()) {
          groups['Yesterday'] = groups['Yesterday'] || [];
          groups['Yesterday'].push(conv);
        } else if (convDate > oneWeekAgo) {
          groups['This Week'] = groups['This Week'] || [];
          groups['This Week'].push(conv);
        } else {
          groups['Older'] = groups['Older'] || [];
          groups['Older'].push(conv);
        }
      });

      return groups;
    }

    if (groupBy === 'tags') {
      const groups: Record<string, typeof filteredConversations> = {};
      
      filteredConversations.forEach((conv) => {
        if (conv.tags && conv.tags.length > 0) {
          conv.tags.forEach((tag) => {
            groups[tag] = groups[tag] || [];
            groups[tag].push(conv);
          });
        } else {
          groups['Untagged'] = groups['Untagged'] || [];
          groups['Untagged'].push(conv);
        }
      });

      return groups;
    }

    return { 'All Conversations': filteredConversations };
  }, [filteredConversations, groupBy]);

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={{ x: -320 }}
        animate={{ x: isOpen ? 0 : -320 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className={cn(
          'fixed lg:sticky lg:top-0 lg:h-screen lg:relative inset-y-0 left-0 z-50 w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-screen',
          className
        )}
      >
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
          {/* Close Button (Mobile) */}
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Conversations
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Info & Theme Toggle */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
              <span className="text-white font-medium">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.email}
              </p>
            </div>
            <button
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Toggle theme"
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* New Conversation Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNewConversation}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-primary text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            <span>New Conversation</span>
          </motion.button>
        </div>

        {/* Search and Filters */}
        <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={localSearchQuery}
              onChange={handleSearchChange}
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          {/* Filter Toggle 
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {showFilters ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
            */}
          {/* Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 space-y-3"
              >
                {/* Status Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value as any)}
                    className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">All</option>
                    <option value="recent">Recent</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                {/* Group By */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Group by
                  </label>
                  <select
                    value={groupBy}
                    onChange={(e) => setGroupBy(e.target.value as any)}
                    className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="none">None</option>
                    <option value="date">Date</option>
                    <option value="tags">Tags</option>
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Conversations List — scrollable */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 min-h-0">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading conversations...</p>
            </div>
          ) : Object.keys(groupedConversations).length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <Folder className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {localSearchQuery ? 'No conversations found' : 'No conversations yet'}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {localSearchQuery ? 'Try a different search term' : 'Start a new conversation to get started'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedConversations).map(([groupName, groupConversations]) => (
                <div key={groupName}>
                  {groupBy !== 'none' && (
                    <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                      {groupName}
                    </h3>
                  )}
                  <div className="space-y-2">
                    {groupConversations.map((conversation) => (
                      <ConversationItem
                        key={conversation.id}
                        conversation={conversation}
                        isActive={currentConversationId === conversation.id}
                        onSelect={() => handleConversationSelect(conversation.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Logout — sticky at bottom */}
        <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:border-red-800 dark:hover:text-red-400 transition-all duration-200 group"
            title="Logout"
          >
            <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            <span className="text-sm font-medium">Logout</span>
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}

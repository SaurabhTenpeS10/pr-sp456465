'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  User, 
  Bot, 
  Database, 
  Palette, 
  Bell, 
  Download, 
  Trash2,
  Shield
} from 'lucide-react';
import { LLMSettings } from './llm-settings';
import { CacheSettings } from './cache-settings';
import { ThemeSettings } from './theme-settings';
import { ProfileSettings } from './profile-settings';
import { NotificationSettings } from './notification-settings';
import { DataSettings } from './data-settings';
import { cn } from '@/lib/utils';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'profile' | 'llm' | 'cache' | 'theme' | 'notifications' | 'data';

const tabs = [
  {
    id: 'profile' as SettingsTab,
    label: 'Profile',
    icon: User,
    description: 'Manage your account and profile information',
  },
  {
    id: 'llm' as SettingsTab,
    label: 'LLM Providers',
    icon: Bot,
    description: 'Configure AI models and API keys',
  },
  {
    id: 'cache' as SettingsTab,
    label: 'Cache Settings',
    icon: Database,
    description: 'Configure caching behavior and thresholds',
  },
  {
    id: 'theme' as SettingsTab,
    label: 'Appearance',
    icon: Palette,
    description: 'Customize theme and visual preferences',
  },
  {
    id: 'notifications' as SettingsTab,
    label: 'Notifications',
    icon: Bell,
    description: 'Manage notification preferences',
  },
  {
    id: 'data' as SettingsTab,
    label: 'Data & Privacy',
    icon: Shield,
    description: 'Export data and manage privacy settings',
  },
];

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings />;
      case 'llm':
        return <LLMSettings />;
      case 'cache':
        return <CacheSettings />;
      case 'theme':
        return <ThemeSettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'data':
        return <DataSettings />;
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Settings
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Manage your PromptCache AI preferences and configuration
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar */}
              <div className="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
                <nav className="p-4 space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                          'w-full flex items-start space-x-3 p-3 rounded-lg text-left transition-colors',
                          isActive
                            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        )}
                      >
                        <Icon className={cn(
                          'w-5 h-5 mt-0.5 flex-shrink-0',
                          isActive 
                            ? 'text-primary-600 dark:text-primary-400' 
                            : 'text-gray-500 dark:text-gray-400'
                        )} />
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            'text-sm font-medium',
                            isActive 
                              ? 'text-primary-700 dark:text-primary-300' 
                              : 'text-gray-900 dark:text-white'
                          )}>
                            {tab.label}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {tab.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Main Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {renderTabContent()}
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

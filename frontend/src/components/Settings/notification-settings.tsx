'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Mail, Smartphone, Monitor } from 'lucide-react';

export function NotificationSettings() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Notification Preferences
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Choose how and when you want to receive notifications from PromptCache AI.
        </p>
      </div>

      {/* Email Notifications */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Mail className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h4 className="text-md font-medium text-gray-900 dark:text-white">
            Email Notifications
          </h4>
        </div>
        
        <div className="space-y-4">
          {[
            { label: 'Cache hit reports', description: 'Weekly summary of cache performance' },
            { label: 'API usage alerts', description: 'When approaching usage limits' },
            { label: 'Security notifications', description: 'Login attempts and security events' },
            { label: 'Product updates', description: 'New features and improvements' },
          ].map((item) => (
            <label key={item.label} className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {item.label}
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {item.description}
                </p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Push Notifications */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Bell className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h4 className="text-md font-medium text-gray-900 dark:text-white">
            Push Notifications
          </h4>
        </div>
        
        <div className="space-y-4">
          {[
            { label: 'Response ready', description: 'When AI finishes generating a response' },
            { label: 'Cache cleared', description: 'When cache is manually or automatically cleared' },
            { label: 'Error alerts', description: 'When API calls fail or encounter errors' },
          ].map((item) => (
            <label key={item.label} className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {item.label}
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {item.description}
                </p>
              </div>
              <input
                type="checkbox"
                className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-2 bg-gradient-primary text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          Save Preferences
        </motion.button>
      </div>
    </div>
  );
}

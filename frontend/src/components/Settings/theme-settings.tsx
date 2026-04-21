'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Monitor, Palette } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

const themes = [
  { value: 'light', label: 'Light', icon: Sun, description: 'Clean and bright interface' },
  { value: 'dark', label: 'Dark', icon: Moon, description: 'Easy on the eyes' },
  { value: 'system', label: 'System', icon: Monitor, description: 'Follow system preference' },
];

const colorSchemes = [
  { name: 'Default', primary: 'bg-sky-500', secondary: 'bg-purple-500', accent: 'bg-orange-500' },
  { name: 'Ocean', primary: 'bg-blue-500', secondary: 'bg-teal-500', accent: 'bg-cyan-500' },
  { name: 'Forest', primary: 'bg-green-500', secondary: 'bg-emerald-500', accent: 'bg-lime-500' },
  { name: 'Sunset', primary: 'bg-orange-500', secondary: 'bg-red-500', accent: 'bg-pink-500' },
  { name: 'Purple', primary: 'bg-purple-500', secondary: 'bg-violet-500', accent: 'bg-indigo-500' },
];

export function ThemeSettings() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Appearance Settings
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Customize the look and feel of PromptCache AI to match your preferences.
        </p>
      </div>

      {/* Theme Selection */}
      <div>
        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
          Theme
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {themes.map((themeOption) => {
            const Icon = themeOption.icon;
            const isSelected = theme === themeOption.value;
            
            return (
              <motion.button
                key={themeOption.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setTheme(themeOption.value)}
                className={cn(
                  'relative flex flex-col items-center p-6 rounded-lg border-2 transition-all',
                  isSelected
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                )}
              >
                <Icon className={cn(
                  'w-8 h-8 mb-3',
                  isSelected 
                    ? 'text-primary-600 dark:text-primary-400' 
                    : 'text-gray-500 dark:text-gray-400'
                )} />
                <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  {themeOption.label}
                </h5>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  {themeOption.description}
                </p>
                {isSelected && (
                  <div className="absolute top-2 right-2 w-3 h-3 bg-primary-500 rounded-full" />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Color Scheme */}
      <div>
        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
          Color Scheme
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {colorSchemes.map((scheme, index) => (
            <motion.button
              key={scheme.name}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'relative flex items-center space-x-3 p-4 rounded-lg border-2 transition-all',
                index === 0
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
              )}
            >
              <div className="flex space-x-1">
                <div className={cn('w-4 h-4 rounded-full', scheme.primary)} />
                <div className={cn('w-4 h-4 rounded-full', scheme.secondary)} />
                <div className={cn('w-4 h-4 rounded-full', scheme.accent)} />
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {scheme.name}
              </span>
              {index === 0 && (
                <div className="absolute top-2 right-2 w-3 h-3 bg-primary-500 rounded-full" />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
          Preview
        </h4>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Palette className="w-4 h-4 text-white" />
            </div>
            <div>
              <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                PromptCache AI
              </h5>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Smart LLM response caching
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-end">
              <div className="bg-gradient-primary text-white px-3 py-2 rounded-lg text-sm max-w-xs">
                Hello! How can I help you today?
              </div>
            </div>
            
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 rounded-lg text-sm max-w-xs">
                I'd like to learn about caching strategies.
              </div>
            </div>
            
            <div className="flex justify-end">
              <div className="bg-gradient-primary text-white px-3 py-2 rounded-lg text-sm max-w-xs">
                I'd be happy to explain caching strategies! There are several approaches...
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Options */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
          Additional Options
        </h4>
        
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Reduce Motion
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Minimize animations and transitions
              </p>
            </div>
            <input
              type="checkbox"
              className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
          </label>

          <label className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                High Contrast
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Increase contrast for better accessibility
              </p>
            </div>
            <input
              type="checkbox"
              className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
          </label>

          <label className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Compact Mode
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Reduce spacing and padding for more content
              </p>
            </div>
            <input
              type="checkbox"
              className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
          </label>
        </div>
      </div>
    </div>
  );
}

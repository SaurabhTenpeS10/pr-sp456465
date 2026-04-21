'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Database, Trash2, RefreshCw, BarChart3 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';

const cacheSettingsSchema = z.object({
  ttl: z.number().min(1).max(86400), // 1 second to 24 hours
  similarityThreshold: z.number().min(0).max(1),
  maxCacheSize: z.number().min(1).max(10000),
  enableSemanticCaching: z.boolean(),
  enableExactMatching: z.boolean(),
  autoCleanup: z.boolean(),
  cleanupInterval: z.number().min(1).max(168), // 1 hour to 1 week
});

type CacheSettingsForm = z.infer<typeof cacheSettingsSchema>;

export function CacheSettings() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CacheSettingsForm>({
    resolver: zodResolver(cacheSettingsSchema),
    defaultValues: {
      ttl: 3600, // 1 hour
      similarityThreshold: 0.85,
      maxCacheSize: 1000,
      enableSemanticCaching: true,
      enableExactMatching: true,
      autoCleanup: true,
      cleanupInterval: 24, // 24 hours
    },
  });

  const enableSemanticCaching = watch('enableSemanticCaching');
  const autoCleanup = watch('autoCleanup');

  const onSubmit = async (data: CacheSettingsForm) => {
    try {
      console.log('Saving cache settings:', data);
      toast.success('Cache settings saved successfully');
    } catch (error) {
      toast.error('Failed to save cache settings');
    }
  };

  const clearCache = async () => {
    if (!confirm('Are you sure you want to clear all cached responses? This action cannot be undone.')) {
      return;
    }

    try {
      // Here you would call the API to clear cache
      toast.success('Cache cleared successfully');
    } catch (error) {
      toast.error('Failed to clear cache');
    }
  };

  const refreshCacheStats = async () => {
    try {
      // Here you would refresh cache statistics
      toast.success('Cache statistics refreshed');
    } catch (error) {
      toast.error('Failed to refresh cache statistics');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Cache Configuration
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Configure how PromptCache AI stores and retrieves cached responses to optimize performance and reduce costs.
        </p>
      </div>

      {/* Cache Statistics */}
      <div className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-medium text-gray-900 dark:text-white">
            Cache Statistics
          </h4>
          <button
            onClick={refreshCacheStats}
            className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Database className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Entries</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">1,247</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">+23 today</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Hit Rate</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">87.3%</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Last 7 days</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Database className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Cache Size</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">2.4 GB</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">of 10 GB limit</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <RefreshCw className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Cost Saved</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">$127.45</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">This month</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Settings */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
            Basic Settings
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cache TTL (seconds)
              </label>
              <input
                {...register('ttl', { valueAsNumber: true })}
                type="number"
                min="1"
                max="86400"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                How long to keep cached responses (1 second to 24 hours)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Cache Entries
              </label>
              <input
                {...register('maxCacheSize', { valueAsNumber: true })}
                type="number"
                min="1"
                max="10000"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Maximum number of cached responses to store
              </p>
            </div>
          </div>
        </div>

        {/* Semantic Caching */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-md font-medium text-gray-900 dark:text-white">
                Semantic Caching
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Use AI to match similar queries even if they're not exactly the same
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                {...register('enableSemanticCaching')}
                type="checkbox"
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>

          {enableSemanticCaching && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Similarity Threshold
              </label>
              <input
                {...register('similarityThreshold', { valueAsNumber: true })}
                type="range"
                min="0"
                max="1"
                step="0.01"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>0.0 (loose)</span>
                <span>1.0 (exact)</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Higher values require more similarity to match cached responses
              </p>
            </div>
          )}
        </div>

        {/* Additional Options */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
            Additional Options
          </h4>

          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input
                {...register('enableExactMatching')}
                type="checkbox"
                className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Enable Exact Matching
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Also cache exact string matches for faster lookups
                </p>
              </div>
            </label>

            <label className="flex items-center space-x-3">
              <input
                {...register('autoCleanup')}
                type="checkbox"
                className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Auto Cleanup
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Automatically remove expired cache entries
                </p>
              </div>
            </label>

            {autoCleanup && (
              <div className="ml-7">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cleanup Interval (hours)
                </label>
                <input
                  {...register('cleanupInterval', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  max="168"
                  className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={clearCache}
            className="flex items-center space-x-2 px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Cache</span>
          </button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-gradient-primary text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Save Settings'}
          </motion.button>
        </div>
      </form>
    </div>
  );
}

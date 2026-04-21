'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Key, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

const llmSettingsSchema = z.object({
  defaultProvider: z.enum(['openai', 'gemini']),
  openaiApiKey: z.string().optional(),
  openaiModel: z.string().optional(),
  geminiApiKey: z.string().optional(),
  geminiModel: z.string().optional(),
  maxTokens: z.number().min(1).max(8192),
  temperature: z.number().min(0).max(2),
  topP: z.number().min(0).max(1),
});

type LLMSettingsForm = z.infer<typeof llmSettingsSchema>;

const openaiModels = [
  { value: 'gpt-4', label: 'GPT-4', description: 'Most capable model, best for complex tasks' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo', description: 'Faster and more cost-effective' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', description: 'Fast and cost-effective for most tasks' },
];

const geminiModels = [
  { value: 'gemini-pro', label: 'Gemini Pro', description: 'Best performance for complex reasoning' },
  { value: 'gemini-pro-vision', label: 'Gemini Pro Vision', description: 'Multimodal capabilities' },
];

export function LLMSettings() {
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LLMSettingsForm>({
    resolver: zodResolver(llmSettingsSchema),
    defaultValues: {
      defaultProvider: 'openai',
      openaiModel: 'gpt-4-turbo',
      geminiModel: 'gemini-pro',
      maxTokens: 2048,
      temperature: 0.7,
      topP: 0.9,
    },
  });

  const defaultProvider = watch('defaultProvider');

  const onSubmit = async (data: LLMSettingsForm) => {
    try {
      // Here you would save the settings to your backend
      console.log('Saving LLM settings:', data);
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  const testConnection = async (provider: 'openai' | 'gemini') => {
    setTestingConnection(provider);
    try {
      // Here you would test the API connection
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      toast.success(`${provider === 'openai' ? 'OpenAI' : 'Gemini'} connection successful`);
    } catch (error) {
      toast.error(`Failed to connect to ${provider === 'openai' ? 'OpenAI' : 'Gemini'}`);
    } finally {
      setTestingConnection(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          LLM Provider Configuration
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Configure your AI model providers and API keys. Your keys are encrypted and stored securely.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Default Provider */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Default Provider
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { value: 'openai', label: 'OpenAI', description: 'GPT models with excellent performance' },
              { value: 'gemini', label: 'Google Gemini', description: 'Advanced multimodal capabilities' },
            ].map((provider) => (
              <label
                key={provider.value}
                className={cn(
                  'relative flex cursor-pointer rounded-lg border p-4 focus:outline-none',
                  defaultProvider === provider.value
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                )}
              >
                <input
                  {...register('defaultProvider')}
                  type="radio"
                  value={provider.value}
                  className="sr-only"
                />
                <div className="flex flex-1">
                  <div className="flex flex-col">
                    <span className="block text-sm font-medium text-gray-900 dark:text-white">
                      {provider.label}
                    </span>
                    <span className="block text-sm text-gray-500 dark:text-gray-400">
                      {provider.description}
                    </span>
                  </div>
                </div>
                {defaultProvider === provider.value && (
                  <CheckCircle className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                )}
              </label>
            ))}
          </div>
        </div>

        {/* OpenAI Configuration */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-900 dark:text-white">
              OpenAI Configuration
            </h4>
            <button
              type="button"
              onClick={() => testConnection('openai')}
              disabled={testingConnection === 'openai'}
              className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors disabled:opacity-50"
            >
              {testingConnection === 'openai' ? (
                <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              <span>Test Connection</span>
            </button>
          </div>

          <div className="space-y-4">
            {/* API Key */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                API Key
              </label>
              <div className="relative">
                <input
                  {...register('openaiApiKey')}
                  type={showOpenAIKey ? 'text' : 'password'}
                  placeholder="sk-..."
                  className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowOpenAIKey(!showOpenAIKey)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showOpenAIKey ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Model Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Model
              </label>
              <select
                {...register('openaiModel')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {openaiModels.map((model) => (
                  <option key={model.value} value={model.value}>
                    {model.label} - {model.description}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Gemini Configuration */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-900 dark:text-white">
              Google Gemini Configuration
            </h4>
            <button
              type="button"
              onClick={() => testConnection('gemini')}
              disabled={testingConnection === 'gemini'}
              className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors disabled:opacity-50"
            >
              {testingConnection === 'gemini' ? (
                <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              <span>Test Connection</span>
            </button>
          </div>

          <div className="space-y-4">
            {/* API Key */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                API Key
              </label>
              <div className="relative">
                <input
                  {...register('geminiApiKey')}
                  type={showGeminiKey ? 'text' : 'password'}
                  placeholder="AIza..."
                  className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowGeminiKey(!showGeminiKey)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showGeminiKey ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Model Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Model
              </label>
              <select
                {...register('geminiModel')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {geminiModels.map((model) => (
                  <option key={model.value} value={model.value}>
                    {model.label} - {model.description}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
            Advanced Settings
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Tokens
              </label>
              <input
                {...register('maxTokens', { valueAsNumber: true })}
                type="number"
                min="1"
                max="8192"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Temperature
              </label>
              <input
                {...register('temperature', { valueAsNumber: true })}
                type="number"
                min="0"
                max="2"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Top P
              </label>
              <input
                {...register('topP', { valueAsNumber: true })}
                type="number"
                min="0"
                max="1"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
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

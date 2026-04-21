'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Download, Upload, Trash2, Shield, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function DataSettings() {
  const handleExportData = async () => {
    try {
      // Here you would call the API to export data
      toast.success('Data export started. You will receive an email when ready.');
    } catch (error) {
      toast.error('Failed to start data export');
    }
  };

  const handleImportData = async () => {
    try {
      // Here you would handle file upload and import
      toast.success('Data import started');
    } catch (error) {
      toast.error('Failed to import data');
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.')) {
      return;
    }

    try {
      // Here you would call the API to delete account
      toast.success('Account deletion request submitted');
    } catch (error) {
      toast.error('Failed to delete account');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Data & Privacy
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Manage your data, privacy settings, and account deletion options.
        </p>
      </div>

      {/* Data Export */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Download className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h4 className="text-md font-medium text-gray-900 dark:text-white">
            Export Your Data
          </h4>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Download a copy of all your conversations, settings, and cached responses in JSON format.
        </p>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleExportData}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-900/30 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export Data</span>
        </motion.button>
      </div>

      {/* Data Import */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Upload className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h4 className="text-md font-medium text-gray-900 dark:text-white">
            Import Data
          </h4>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Import conversations and settings from a previously exported file.
        </p>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleImportData}
          className="flex items-center space-x-2 px-4 py-2 bg-secondary-100 dark:bg-secondary-900/20 text-secondary-700 dark:text-secondary-300 rounded-lg hover:bg-secondary-200 dark:hover:bg-secondary-900/30 transition-colors"
        >
          <Upload className="w-4 h-4" />
          <span>Import Data</span>
        </motion.button>
      </div>

      {/* Privacy Settings */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h4 className="text-md font-medium text-gray-900 dark:text-white">
            Privacy Settings
          </h4>
        </div>
        
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Analytics & Usage Data
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Help improve PromptCache AI by sharing anonymous usage statistics
              </p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
          </label>

          <label className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Crash Reports
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Automatically send crash reports to help fix bugs
              </p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
          </label>

          <label className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Marketing Communications
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Receive emails about new features and product updates
              </p>
            </div>
            <input
              type="checkbox"
              className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
          </label>
        </div>
      </div>

      {/* Data Retention */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
          Data Retention
        </h4>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 dark:text-gray-300">Conversation History</span>
            <select className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option>Keep forever</option>
              <option>1 year</option>
              <option>6 months</option>
              <option>3 months</option>
              <option>1 month</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 dark:text-gray-300">Cache Data</span>
            <select className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option>30 days</option>
              <option>7 days</option>
              <option>1 day</option>
              <option>1 hour</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 dark:text-gray-300">Usage Analytics</span>
            <select className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option>1 year</option>
              <option>6 months</option>
              <option>3 months</option>
              <option>Never collect</option>
            </select>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <h4 className="text-md font-medium text-red-900 dark:text-red-100">
            Danger Zone
          </h4>
        </div>
        
        <p className="text-sm text-red-700 dark:text-red-300 mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleDeleteAccount}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete Account</span>
        </motion.button>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-2 bg-gradient-primary text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          Save Settings
        </motion.button>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/lib/providers/theme-provider';

export default function TermsPage() {
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative">
      {/* Theme Toggle */}
      <button
        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-700/50 transition-colors backdrop-blur-sm"
        aria-label="Toggle theme"
      >
        {resolvedTheme === 'dark' ? (
          <Sun className="w-5 h-5" />
        ) : (
          <Moon className="w-5 h-5" />
        )}
      </button>

      {/* Back to Home */}
      <Link
        href="/"
        className="absolute top-4 left-4 flex items-center space-x-2 p-2 rounded-lg bg-white/10 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-700/50 transition-colors backdrop-blur-sm"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-medium">Back to Home</span>
      </Link>

      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl mb-6 shadow-glow"
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-4xl font-bold text-gradient-primary mb-4">
              Terms of Service
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700"
          >
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing and using PromptCache AI, you accept and agree to be bound by the terms and provision of this agreement.
              </p>

              <h2>2. Service Description</h2>
              <p>
                PromptCache AI provides intelligent caching services for Large Language Model (LLM) responses to optimize costs and improve performance for AI applications.
              </p>

              <h2>3. User Responsibilities</h2>
              <ul>
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>You agree to use the service in compliance with all applicable laws and regulations</li>
                <li>You will not attempt to reverse engineer or compromise the security of our systems</li>
              </ul>

              <h2>4. Service Availability</h2>
              <p>
                While we strive to maintain high availability, we do not guarantee uninterrupted access to our services. Scheduled maintenance and updates may temporarily affect service availability.
              </p>

              <h2>5. Data and Privacy</h2>
              <p>
                Your use of our service is also governed by our Privacy Policy. We are committed to protecting your data and maintaining transparency about our data practices.
              </p>

              <h2>6. Limitation of Liability</h2>
              <p>
                PromptCache AI shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.
              </p>

              <h2>7. Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. Users will be notified of significant changes via email or through the service interface.
              </p>

              <h2>8. Contact Information</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us at support@promptcache.ai
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/auth/register"
                  className="btn-primary text-center"
                >
                  Back to Registration
                </Link>
                <Link
                  href="/privacy"
                  className="btn-secondary text-center"
                >
                  View Privacy Policy
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

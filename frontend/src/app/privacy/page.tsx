'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Sun, Moon, Shield } from 'lucide-react';
import { useTheme } from '@/lib/providers/theme-provider';

export default function PrivacyPage() {
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
              <Shield className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-4xl font-bold text-gradient-primary mb-4">
              Privacy Policy
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
              <h2>1. Information We Collect</h2>
              <p>
                We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.
              </p>
              <ul>
                <li><strong>Account Information:</strong> Email address, name, and authentication credentials</li>
                <li><strong>Usage Data:</strong> API requests, response caching patterns, and service usage metrics</li>
                <li><strong>Technical Data:</strong> IP addresses, browser information, and device identifiers</li>
              </ul>

              <h2>2. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul>
                <li>Provide, maintain, and improve our caching services</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices, updates, and support messages</li>
                <li>Monitor and analyze trends and usage patterns</li>
              </ul>

              <h2>3. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>

              <h2>4. Data Retention</h2>
              <p>
                We retain your personal information only for as long as necessary to provide our services and fulfill the purposes outlined in this policy, unless a longer retention period is required by law.
              </p>

              <h2>5. Information Sharing</h2>
              <p>
                We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy or as required by law.
              </p>

              <h2>6. Your Rights</h2>
              <p>You have the right to:</p>
              <ul>
                <li>Access and update your personal information</li>
                <li>Request deletion of your data</li>
                <li>Opt out of certain communications</li>
                <li>Request data portability</li>
              </ul>

              <h2>7. Cookies and Tracking</h2>
              <p>
                We use cookies and similar technologies to enhance your experience, analyze usage patterns, and provide personalized content.
              </p>

              <h2>8. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
              </p>

              <h2>9. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at privacy@promptcache.ai
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
                  href="/terms"
                  className="btn-secondary text-center"
                >
                  View Terms of Service
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

'use client';

import { useAuth } from '@/lib/auth/context';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Zap,
  MessageSquare,
  Clock,
  ArrowLeft,
  Calendar,
  Mail,
  RefreshCw,
  AlertCircle,
  Hash,
  Layers,
} from 'lucide-react';
import Link from 'next/link';
import { chatApiService } from '@/lib/api/chat';
import { format } from 'date-fns';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const {
    data: stats,
    isLoading: statsLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['chatStats'],
    queryFn: () => chatApiService.getChatStats(),
    enabled: isAuthenticated,
    retry: 1,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="spinner w-8 h-8" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="card text-center max-w-md mx-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Authentication Required</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Please sign in to view your profile and analytics.</p>
          <Link href="/auth/login" className="btn-primary inline-block">Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile & Analytics</h1>
          <div className="w-24" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-white text-2xl font-bold">
              {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name || 'User'}</h2>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {format(new Date(user.createdAt), 'MMM d, yyyy')}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {statsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4" />
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : error ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card mt-8 text-center">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Failed to load statistics</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{(error as Error).message}</p>
            <button onClick={() => refetch()} className="btn-secondary">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </button>
          </motion.div>
        ) : stats ? (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            <motion.div variants={itemVariants} className="card card-hover">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg w-fit mb-4">
                <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">${stats.totalCostSaved.toFixed(4)}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Savings</p>
            </motion.div>

            <motion.div variants={itemVariants} className="card card-hover">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg w-fit mb-4">
                <Zap className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{stats.cacheHitRate.toFixed(1)}%</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Cache Efficiency</p>
            </motion.div>

            <motion.div variants={itemVariants} className="card card-hover">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg w-fit mb-4">
                <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalMessages.toLocaleString()}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Usage Volume</p>
            </motion.div>

            <motion.div variants={itemVariants} className="card card-hover">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg w-fit mb-4">
                <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">Cache Hit</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">{stats.averageResponseTimeCacheHit.toFixed(0)}ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-red-600 dark:text-red-400 font-medium">Live API</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">{stats.averageResponseTimeLive.toFixed(0)}ms</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">Performance</p>
            </motion.div>

            <motion.div variants={itemVariants} className="card card-hover">
              <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg w-fit mb-4">
                <Hash className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalTokensUsed.toLocaleString()}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Tokens Consumed</p>
            </motion.div>

            <motion.div variants={itemVariants} className="card card-hover">
              <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg w-fit mb-4">
                <Layers className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalTokensSaved.toLocaleString()}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Tokens Saved</p>
            </motion.div>
          </motion.div>
        ) : null}
      </main>
    </div>
  );
}

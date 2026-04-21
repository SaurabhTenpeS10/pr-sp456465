'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex w-full mb-4 justify-start"
    >
      <div className="flex max-w-[80%] md:max-w-[70%]">
        {/* Avatar */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 mr-3 flex items-center justify-center">
          <Bot className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </div>

        {/* Typing Bubble */}
        <div className="flex flex-col items-start">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-2xl">
            <div className="flex items-center space-x-1">
              <span className="text-sm text-gray-600 dark:text-gray-400">AI is thinking</span>
              <div className="flex space-x-1 ml-2">
                <motion.div
                  className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: 0,
                  }}
                />
                <motion.div
                  className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: 0.2,
                  }}
                />
                <motion.div
                  className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: 0.4,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

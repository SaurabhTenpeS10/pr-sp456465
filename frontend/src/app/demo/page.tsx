'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, Copy, RefreshCw, Zap, Clock, DollarSign, Sun, Moon, Monitor } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTheme } from '@/lib/providers/theme-provider';

interface Message {
  id: number;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  cached?: boolean;
  similarity?: number;
  responseTime?: string;
  cost?: string;
}

// Cache interface for storing responses
interface CacheEntry {
  query: string;
  response: string;
  timestamp: Date;
  similarity?: number;
}

export default function DemoPage() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  // Response cache - stores latest 10 responses
  const [responseCache, setResponseCache] = useState<CacheEntry[]>([]);

  // Debug: Check if API key is loaded
  console.log('Environment check:', {
    hasGemini: !!process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    geminiPrefix: process.env.NEXT_PUBLIC_GEMINI_API_KEY?.substring(0, 10)
  });

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'user',
      content: 'What are the benefits of renewable energy?',
      timestamp: new Date(Date.now() - 5000),
    },
    {
      id: 2,
      type: 'assistant',
      content: '**Renewable energy** offers numerous benefits including:\n\n1. **Reduced greenhouse gas emissions** - Clean energy sources produce minimal carbon footprint\n2. *Energy independence* - Reduces reliance on fossil fuel imports\n3. **Job creation** - Growing green energy sector creates employment opportunities\n4. *Long-term cost savings* - Lower operational costs after initial investment\n\n### Key Technologies:\n- **Solar power** - Harnesses sunlight through photovoltaic panels\n- **Wind energy** - Uses wind turbines to generate electricity\n- **Hydroelectric** - Generates power from flowing water\n\nThese are sustainable alternatives to fossil fuels that help combat climate change.',
      timestamp: new Date(Date.now() - 4000),
      cached: true,
      similarity: 0.95,
      responseTime: '12ms',
      cost: '$0.000',
    },
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiMode, setApiMode] = useState<'checking' | 'real' | 'simulated' | 'quota_exceeded'>('checking');

  // Check Gemini API key on component mount
  useEffect(() => {
    const geminiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    console.log('🔍 Initial Gemini API key check on mount:', {
      hasGemini: !!geminiKey,
      geminiPrefix: geminiKey?.substring(0, 20) + '...'
    });

    // Check if we have a valid Gemini key
    const hasValidGemini = geminiKey && geminiKey !== 'your-gemini-api-key-here' && geminiKey.startsWith('AIzaSy');

    if (hasValidGemini) {
      setApiMode('real');
      console.log('✅ Valid Gemini API key detected, setting mode to real');
    } else {
      setApiMode('simulated');
      console.log('❌ No valid Gemini API key, setting mode to simulated');
    }
  }, []);

  const demoQuestions = [
    'What are the benefits of renewable energy?',
    'How does solar power work?',
    'What is the future of electric vehicles?',
    'Explain machine learning in simple terms',
  ];

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage = {
      id: Date.now(), // Timestamp-based ID to distinguish from demo messages (id: 1, 2, etc.)
      type: 'user' as const,
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Check if we've reached the trial limit (5-10 messages)
      const userMessageCount = messages.filter(m => m.type === 'user').length + 1;
      if (userMessageCount > 10) {
        const assistantMessage: Message = {
          id: Date.now() + 1,
          type: 'assistant' as const,
          content: 'Trial limit reached! You\'ve used all 10 free messages. Sign up to continue using PromptSplitwise AI with unlimited access and advanced caching features.',
          timestamp: new Date(),
          cached: false,
          responseTime: '0ms',
          cost: '$0.000',
        };
        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
        return;
      }

      // Check for cache hit using the response cache
      const cachedResult = findCachedResponse(content);
      const isCacheHit = cachedResult !== null;
      const similarity = cachedResult?.similarity || 0;

      if (isCacheHit && cachedResult) {
        // Cache hit - fast response using actual cached content
        setTimeout(() => {
          const assistantMessage: Message = {
            id: Date.now() + 1,
            type: 'assistant' as const,
            content: cachedResult.response,
            timestamp: new Date(),
            cached: true,
            similarity,
            responseTime: `${Math.floor(Math.random() * 50) + 5}ms`,
            cost: '$0.000',
          };
          setMessages(prev => [...prev, assistantMessage]);
          setIsLoading(false);
        }, 100);
      } else {
        // Cache miss - call AI API (or simulate)
        const response = await callAI(content);

        // Add the new response to cache
        addToCache(content, response);

        const assistantMessage: Message = {
          id: Date.now() + 1,
          type: 'assistant' as const,
          content: response,
          timestamp: new Date(),
          cached: false,
          responseTime: `${Math.floor(Math.random() * 2000) + 500}ms`,
          cost: `$${(Math.random() * 0.01).toFixed(4)}`,
        };
        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        type: 'assistant' as const,
        content: 'Sorry, there was an error processing your request. Please try again.',
        timestamp: new Date(),
        cached: false,
        responseTime: '0ms',
        cost: '$0.000',
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  // Simple similarity calculation (Jaccard similarity)
  const calculateSimilarity = (str1: string, str2: string): number => {
    const words1 = str1.split(' ');
    const words2 = str2.split(' ');
    const set1 = new Set(words1);
    const set2 = new Set(words2);

    const intersectionArray = Array.from(set1).filter(x => set2.has(x));
    const unionArray = Array.from(new Set([...words1, ...words2]));

    return intersectionArray.length / unionArray.length;
  };

  // Add response to cache (keep only latest 10)
  const addToCache = (query: string, response: string) => {
    const newEntry: CacheEntry = {
      query: query.toLowerCase().trim(),
      response,
      timestamp: new Date()
    };

    console.log('💾 Adding to cache:', newEntry.query);

    setResponseCache(prev => {
      const updated = [newEntry, ...prev];
      // Keep only latest 10 entries
      const final = updated.slice(0, 10);
      console.log('📦 Cache now has', final.length, 'entries');
      return final;
    });
  };

  // Find cached response based on similarity
  const findCachedResponse = (query: string): { response: string; similarity: number } | null => {
    const queryLower = query.toLowerCase().trim();
    let bestMatch: { response: string; similarity: number } | null = null;

    console.log('🔍 Searching cache for:', queryLower);
    console.log('📦 Cache entries:', responseCache.length);

    for (const entry of responseCache) {
      const similarity = calculateSimilarity(queryLower, entry.query);
      console.log(`📊 Similarity with "${entry.query}": ${similarity.toFixed(3)}`);

      if (similarity > 0.7 && (!bestMatch || similarity > bestMatch.similarity)) {
        bestMatch = { response: entry.response, similarity };
        console.log('✅ New best match found!', similarity.toFixed(3));
      }
    }

    if (bestMatch) {
      console.log('🎯 Cache HIT! Similarity:', bestMatch.similarity.toFixed(3));
    } else {
      console.log('❌ Cache MISS - will call API');
    }

    return bestMatch;
  };



  // Call Gemini API or simulate response
  const callAI = async (content: string): Promise<string> => {
    const geminiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    console.log('=== Gemini API Call Debug ===');
    console.log('Gemini Key check:', geminiKey ? 'Found' : 'Not found');
    console.log('Content to send:', content);

    // Validate Gemini API key
    const hasValidGemini = geminiKey && geminiKey !== 'your-gemini-api-key-here' && geminiKey.startsWith('AIzaSy');

    console.log('Gemini API Key validation:', {
      exists: !!geminiKey,
      notPlaceholder: geminiKey !== 'your-gemini-api-key-here',
      startsWithAIzaSy: geminiKey?.startsWith('AIzaSy'),
      isValid: hasValidGemini
    });

    if (hasValidGemini) {
      try {
        console.log('Making API call to AI service...');
        const response = await fetch('/api/test-openai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: content
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('AI API response:', data);
          console.log(`✅ Success with ${data.provider} (${data.model})`);
          return data.response || 'Sorry, I could not generate a response.';
        } else {
          try {
            const errorData = await response.json();
            console.error('API request failed:', errorData);
          } catch {
            console.error('API request failed with status:', response.status);
          }

          // Check for quota exceeded error
          if (response.status === 429) {
            console.log('⚠️ AI API quota exceeded, falling back to simulated response');
            setApiMode('quota_exceeded');
          } else {
            console.log('⚠️ AI API error, falling back to simulated response');
            setApiMode('simulated');
          }

          // Don't throw - fall back to simulated response instead
          console.log('Falling back to simulated response');
        }
      } catch (error) {
        console.error('AI API error:', error);
        console.log('Falling back to simulated response due to error');
        setApiMode('simulated');
        // Fall back to simulated response
      }
    } else {
      console.log('No valid Gemini API key found, using simulated response');
      setApiMode('simulated');
    }

    // Simulate response for demo purposes
    console.log('Using simulated response');
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    const responses = [
      `Here's a comprehensive answer about "${content}": This topic involves multiple aspects that are important to understand. The key considerations include practical applications, theoretical foundations, and real-world implications that affect various stakeholders.`,
      `Regarding "${content}", there are several key points to consider: First, the fundamental principles that govern this area, second, the practical applications in modern contexts, and third, the future developments we can expect to see.`,
      `To answer your question about "${content}", let me break this down into manageable parts: The core concepts, implementation strategies, benefits and challenges, and best practices for success.`,
      `"${content}" is an interesting topic. From a technical perspective, it involves understanding the underlying mechanisms, evaluating different approaches, and considering the broader impact on related systems and processes.`,
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Home</span>
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Live Demo
            </h1>
            {/* Theme Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light')}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title={`Current theme: ${theme}. Click to cycle through themes.`}
              >
                {theme === 'light' && <Sun className="w-5 h-5 text-yellow-500" />}
                {theme === 'dark' && <Moon className="w-5 h-5 text-blue-400" />}
                {theme === 'system' && <Monitor className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
              </button>
              <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                {theme === 'system' ? `Auto (${resolvedTheme})` : theme}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 h-[600px] flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  AI Chat with Intelligent Caching
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Powered by Google Gemini AI - Try asking questions to see cache hits and cost savings in action
                </p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] ${message.type === 'user' ? 'bg-gradient-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'} rounded-2xl p-4`}>
                      {message.type === 'assistant' ? (
                        <div className="text-sm prose prose-sm dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              h1: ({children}) => <h1 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">{children}</h1>,
                              h2: ({children}) => <h2 className="text-base font-bold mb-2 text-gray-900 dark:text-white">{children}</h2>,
                              h3: ({children}) => <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">{children}</h3>,
                              p: ({children}) => <p className="mb-2 last:mb-0 text-gray-700 dark:text-gray-300 leading-relaxed">{children}</p>,
                              strong: ({children}) => <strong className="font-semibold text-gray-900 dark:text-white">{children}</strong>,
                              em: ({children}) => <em className="italic text-gray-700 dark:text-gray-300">{children}</em>,
                              ul: ({children}) => <ul className="list-disc list-inside mb-3 space-y-1 text-gray-700 dark:text-gray-300">{children}</ul>,
                              ol: ({children}) => <ol className="list-decimal list-inside mb-3 space-y-1 text-gray-700 dark:text-gray-300">{children}</ol>,
                              li: ({children}) => <li className="text-gray-700 dark:text-gray-300">{children}</li>,
                              code: ({children}) => <code className="bg-gray-200 dark:bg-gray-600 px-1.5 py-0.5 rounded text-xs font-mono text-gray-800 dark:text-gray-200">{children}</code>,
                              pre: ({children}) => <pre className="bg-gray-200 dark:bg-gray-600 p-3 rounded text-xs overflow-x-auto font-mono">{children}</pre>,
                              blockquote: ({children}) => <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-600 dark:text-gray-400 mb-3">{children}</blockquote>
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm">{message.content}</p>
                      )}
                      
                      {message.type === 'assistant' && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-4">
                              {message.cached && (
                                <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                                  <Zap className="w-3 h-3" />
                                  <span>Cache Hit ({(message.similarity! * 100).toFixed(0)}%)</span>
                                </div>
                              )}
                              <div className="flex items-center space-x-1 text-blue-600 dark:text-blue-400">
                                <Clock className="w-3 h-3" />
                                <span>{message.responseTime}</span>
                              </div>
                              <div className="flex items-center space-x-1 text-purple-600 dark:text-purple-400">
                                <DollarSign className="w-3 h-3" />
                                <span>{message.cost}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
                                <Copy className="w-3 h-3" />
                              </button>
                              <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
                                <RefreshCw className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl p-4">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage(inputValue)}
                    placeholder="Ask a question..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                  <button
                    onClick={() => handleSendMessage(inputValue)}
                    disabled={isLoading || !inputValue.trim()}
                    className="btn-primary px-4 py-2"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Demo Controls & Stats */}
          <div className="space-y-6">
            {/* Quick Questions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Try These Questions
              </h3>
              <div className="space-y-2">
                {demoQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(question)}
                    className="w-full text-left p-3 text-sm bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    disabled={isLoading}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            {/* Demo Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Demo Statistics
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Cache Hit Rate</span>
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">73%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Avg Response Time</span>
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">45ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Cost Savings</span>
                  <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">87%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Queries</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{messages.filter(m => m.type === 'user').length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Cache Entries</span>
                  <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{responseCache.length}/10</span>
                </div>
              </div>
            </div>

            {/* Demo Notice */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200">
                  {apiMode === 'real' ? '🟢 Live AI Mode (Google Gemini)' :
                   apiMode === 'quota_exceeded' ? '🟠 API Quota Exceeded (Using Simulation)' :
                   apiMode === 'simulated' ? '🟡 Demo Mode (Simulated)' :
                   '🔄 Checking Gemini API...'}
                </h3>
                <div className="text-amber-700 dark:text-amber-300 text-sm font-medium">
                  {messages.filter(m => m.type === 'user').length}/10 trial messages used
                </div>
              </div>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                {apiMode === 'real'
                  ? 'Using real Google Gemini 2.0 Flash API with intelligent caching simulation. Ask similar questions to see caching in action!'
                  : apiMode === 'quota_exceeded'
                  ? 'Gemini API free tier quota exceeded. You can: (1) Wait until the quota resets, (2) Upgrade to a paid plan at https://console.cloud.google.com, or (3) Use the demo mode below for simulated responses.'
                  : apiMode === 'simulated'
                  ? 'This is a simulated demo. Real responses would come from Google Gemini API (free tier available) with actual semantic similarity matching.'
                  : 'Checking Gemini API configuration...'
                }
              </p>
              {apiMode === 'real' && (
                <div className="mt-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
                  💡 <strong>Live Caching Demo:</strong> Each Gemini response is stored in cache (max 10 entries). Ask similar questions to see real cached responses!
                  Cache entries: {responseCache.length}/10
                </div>
              )}
              <div className="mt-3 text-xs text-amber-600 dark:text-amber-400">
                Gemini API: {process.env.NEXT_PUBLIC_GEMINI_API_KEY && process.env.NEXT_PUBLIC_GEMINI_API_KEY !== 'your-gemini-api-key-here' ?
                  `✅ Configured (${process.env.NEXT_PUBLIC_GEMINI_API_KEY.substring(0, 10)}...)` :
                  '❌ Not configured - Get free key at https://makersuite.google.com/app/apikey'
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

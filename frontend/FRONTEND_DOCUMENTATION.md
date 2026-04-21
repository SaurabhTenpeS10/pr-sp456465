# PromptCache AI Frontend Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture & Technology Stack](#architecture--technology-stack)
3. [Feature Documentation](#feature-documentation)
4. [Page-by-Page Breakdown](#page-by-page-breakdown)
5. [Component Library](#component-library)
6. [State Management](#state-management)
7. [API Integration](#api-integration)
8. [Styling System](#styling-system)
9. [Development Setup](#development-setup)

## Project Overview

PromptCache AI is a sophisticated frontend application that provides an intelligent caching system for Large Language Model (LLM) responses. The application reduces AI API costs by up to 90% through smart caching strategies while maintaining a modern, ChatGPT-like user interface.

### Key Value Propositions
- **Cost Optimization**: Intelligent response caching reduces API costs significantly
- **Performance**: Sub-millisecond cache hits vs. seconds for fresh API calls
- **Multi-LLM Support**: Seamless integration with OpenAI GPT and Google Gemini
- **Smart Matching**: SHA-256 hash-based exact matching + semantic similarity for near-matches
- **Modern UX**: ChatGPT-inspired interface with real-time updates

## Architecture & Technology Stack

### Core Framework
- **Next.js 14.0.3**: React framework with App Router for modern web development
- **TypeScript 5.2.2**: Full type safety across the application
- **React 18.2.0**: Latest React features with concurrent rendering

### Styling & UI
- **Tailwind CSS 3.3.5**: Utility-first CSS framework
- **Framer Motion 10.16.5**: Advanced animations and transitions
- **Lucide React 0.290.0**: Modern icon library
- **Custom Design System**: Gradient-based theme with glass morphism effects

### State Management
- **Zustand 4.4.7**: Lightweight state management for chat functionality
- **React Context**: Authentication and theme management
- **TanStack Query 4.36.1**: Server state management and caching

### Form Handling & Validation
- **React Hook Form 7.47.0**: Performant form management
- **Zod 3.22.0**: TypeScript-first schema validation
- **@hookform/resolvers**: Integration between React Hook Form and Zod

### Development Tools
- **ESLint & Prettier**: Code quality and formatting
- **Jest & Testing Library**: Unit and integration testing
- **TypeScript**: Static type checking

## Feature Documentation

### 1. Authentication System
**Purpose**: Secure user registration, login, and session management

**Features**:
- Email/password authentication with validation
- Form validation using Zod schemas
- JWT token management with automatic refresh
- Protected routes with authentication guards
- Password strength requirements and confirmation

**Security**:
- Client-side form validation
- Secure token storage in localStorage
- Automatic token refresh on API calls
- 401 error handling with redirect to login

### 2. Theme System
**Purpose**: Dynamic light/dark mode switching with system preference detection

**Features**:
- Custom theme provider (not next-themes)
- System preference detection
- Persistent theme storage
- Smooth transitions between themes
- Theme-aware component styling

**Implementation**:
- Custom `ThemeProvider` with React Context
- CSS class-based theme switching
- localStorage persistence
- Media query listening for system changes

### 3. Chat Interface
**Purpose**: ChatGPT-like conversational interface with caching intelligence

**Features**:
- Real-time message streaming
- Conversation management and history
- Message regeneration and editing
- File attachments support
- Cache hit/miss indicators
- Performance metrics display

**Caching Intelligence**:
- Visual indicators for cache hits vs. API calls
- Cost savings calculations
- Response time comparisons
- Cache efficiency metrics

### 4. Demo Experience
**Purpose**: Interactive demonstration of caching capabilities

**Features**:
- Trial limit system (10 free messages)
- Real API integration with Gemini/OpenAI
- Simulated responses for demo purposes
- Live statistics and metrics
- Suggested conversation starters

### 5. Legal Compliance
**Purpose**: Terms of Service and Privacy Policy pages

**Features**:
- Comprehensive legal documentation
- Professional styling matching app theme
- Cross-navigation between legal pages
- Integration with registration flow

## Page-by-Page Breakdown

### Homepage (`/`)
**Purpose**: Landing page with product introduction and call-to-action

**Components Used**:
- Hero section with animated elements
- Feature showcase cards
- Navigation header with theme toggle
- Responsive design with mobile optimization

**User Flow**:
- Authenticated users → Redirect to dashboard
- New users → Registration/login options
- Theme switching available

### Authentication Pages

#### Login (`/auth/login`)
**Purpose**: User authentication with email/password

**Features**:
- Form validation with real-time feedback
- Password visibility toggle
- "Remember me" functionality
- Error handling and display
- Theme toggle and back-to-home navigation

#### Register (`/auth/register`)
**Purpose**: New user account creation

**Features**:
- Multi-field validation (name, email, password, confirmation)
- Terms and Privacy Policy agreement
- Password strength indicators
- Real-time validation feedback
- Theme toggle and back-to-home navigation

### Dashboard (`/dashboard`)
**Purpose**: Main application interface for authenticated users

**Components**:
- `ConversationSidebar`: Chat history and conversation management
- `ChatInterface`: Main chat area with message display
- `SettingsPanel`: Configuration and preferences
- Mobile-responsive header with navigation

**Features**:
- Real-time chat functionality
- Conversation management
- Settings access
- Theme switching
- Logout functionality

### Demo Page (`/demo`)
**Purpose**: Interactive demonstration of caching capabilities

**Features**:
- Trial message system (10 free messages)
- Real API integration (Gemini/OpenAI)
- Cache simulation with realistic metrics
- Live statistics display
- Suggested conversation starters

**API Integration**:
- Primary: Google Gemini API
- Fallback: OpenAI GPT API
- Simulated responses when no API key available

### Legal Pages

#### Terms of Service (`/terms`)
**Purpose**: Legal terms and conditions

**Features**:
- Comprehensive terms documentation
- Professional legal language
- Navigation back to registration
- Theme support

#### Privacy Policy (`/privacy`)
**Purpose**: Data privacy and protection information

**Features**:
- Detailed privacy practices
- User rights documentation
- GDPR compliance information
- Cross-navigation to terms

## Component Library

### Chat Components

#### `ChatInterface`
**Purpose**: Main chat container with message display and input

**Props**:
```typescript
interface ChatInterfaceProps {
  conversationId?: string;
  className?: string;
}
```

**Features**:
- Auto-scroll to bottom
- Message pagination
- Typing indicators
- Error handling
- Scroll-to-bottom button

#### `MessageBubble`
**Purpose**: Individual message display with actions

**Props**:
```typescript
interface MessageBubbleProps {
  message: Message;
  isLast: boolean;
}
```

**Features**:
- User/AI message differentiation
- Copy to clipboard
- Message regeneration
- Timestamp display
- Cache hit indicators

#### `MessageInput`
**Purpose**: Message composition with file attachments

**Features**:
- Multi-line text input
- File attachment support
- Send button with loading states
- Keyboard shortcuts (Enter to send)
- Character/token counting

#### `ConversationSidebar`
**Purpose**: Chat history and conversation management

**Features**:
- Conversation list with search
- New conversation creation
- Conversation deletion
- Mobile responsive drawer
- Real-time updates

### Settings Components

#### `SettingsPanel`
**Purpose**: Main settings container with tabbed interface

**Tabs**:
- Profile: User account management
- LLM Providers: API key configuration
- Cache Settings: Caching behavior
- Appearance: Theme preferences
- Notifications: Alert preferences
- Data & Privacy: Export and privacy controls

#### `LLMSettings`
**Purpose**: AI provider configuration

**Features**:
- API key management
- Model selection
- Parameter tuning (temperature, max tokens)
- Provider switching
- Secure key storage

### Utility Components

#### `TypingIndicator`
**Purpose**: Animated typing indicator for AI responses

**Features**:
- Smooth animation
- Theme-aware styling
- Configurable timing

## State Management

### Authentication Context (`useAuth`)
**Purpose**: Global authentication state management

**State**:
```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
```

**Actions**:
- `login(credentials)`: Authenticate user
- `register(credentials)`: Create new account
- `logout()`: Clear session
- `refreshToken()`: Renew access token

### Chat Store (`useChatStore`)
**Purpose**: Chat functionality with Zustand

**State**:
```typescript
interface ChatState {
  conversations: Conversation[];
  currentConversationId: string | null;
  messages: Record<string, Message[]>;
  isLoading: boolean;
  isTyping: boolean;
  error: string | null;
}
```

**Actions**:
- `loadConversations()`: Fetch chat history
- `sendMessage()`: Send new message
- `createConversation()`: Start new chat
- `deleteConversation()`: Remove chat
- WebSocket management for real-time updates

### Theme Provider (`useTheme`)
**Purpose**: Theme state management

**State**:
```typescript
interface ThemeState {
  theme: 'light' | 'dark' | 'system';
  resolvedTheme: 'light' | 'dark';
}
```

**Features**:
- System preference detection
- localStorage persistence
- CSS class management
- Media query listening

## API Integration

### Base Configuration
- **Base URL**: `http://localhost:8001/api/v1`
- **Authentication**: Bearer token in headers
- **Error Handling**: Automatic 401 handling with auth refresh

### Chat API Service (`chatApiService`)
**Endpoints**:
- `GET /conversations`: Fetch conversation list
- `POST /conversations`: Create new conversation
- `GET /conversations/:id/messages`: Get conversation messages
- `POST /messages`: Send new message
- `POST /messages/:id/regenerate`: Regenerate response
- `DELETE /messages/:id`: Delete message
- `GET /stats`: Get cache statistics

**Features**:
- Automatic token injection
- File upload support
- WebSocket connections
- Error handling and retry logic

### Authentication API (`authApiService`)
**Endpoints**:
- `POST /auth/login`: User authentication
- `POST /auth/register`: Account creation
- `POST /auth/logout`: Session termination
- `GET /auth/profile`: User profile
- `POST /auth/refresh`: Token refresh

**Security**:
- JWT token management
- Automatic token refresh
- Secure credential handling

## Styling System

### Design Tokens
**Colors**:
- Primary: Blue gradient (`#0ea5e9` to `#3b82f6`)
- Secondary: Purple gradient (`#8b5cf6` to `#a855f7`)
- Accent: Green gradient (`#10b981` to `#059669`)

**Typography**:
- Font: Inter (Google Fonts)
- Headings: Bold weights with gradient text
- Body: Regular weight with theme-aware colors

### Custom CSS Classes
```css
.btn-primary: Primary button with gradient background
.btn-secondary: Secondary button with outline style
.text-gradient-primary: Gradient text effect
.bg-gradient-primary: Primary gradient background
.glass: Glass morphism effect
.shadow-glow: Glowing shadow effect
```

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Flexible layouts with CSS Grid and Flexbox
- Touch-friendly interface elements

### Dark Mode Implementation
- CSS class-based switching (`light`/`dark` on `html`)
- Theme-aware color variables
- Smooth transitions between themes
- System preference detection

## Development Setup

### Prerequisites
- Node.js ≥18.0.0
- npm ≥8.0.0

### Installation
```bash
cd promptcache-ai/frontend
npm install
```

### Environment Configuration
Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8001
NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-key
NEXT_PUBLIC_OPENAI_API_KEY=your-openai-key
```

### Development Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript checking
npm test             # Run tests
```

### Project Structure
```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable UI components
├── lib/                # Utilities and configurations
│   ├── api/            # API service layers
│   ├── auth/           # Authentication logic
│   ├── providers/      # React context providers
│   ├── stores/         # Zustand stores
│   └── types/          # TypeScript definitions
└── styles/             # Global styles and themes
```

### Testing Strategy
- Unit tests for utility functions
- Component testing with React Testing Library
- Integration tests for API services
- E2E testing for critical user flows

### Performance Optimization
- Next.js automatic code splitting
- Image optimization with next/image
- Bundle analysis and optimization
- Lazy loading for non-critical components
- Efficient re-rendering with React.memo and useMemo

## Advanced Features

### WebSocket Integration
**Purpose**: Real-time communication for live chat updates

**Implementation**:
```typescript
// WebSocket connection management in chat store
const ws = new WebSocket(`${API_BASE_URL}/ws/chat?token=${token}`);
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Handle real-time message updates
};
```

**Features**:
- Real-time message delivery
- Typing indicators
- Connection state management
- Automatic reconnection
- Message queuing during disconnection

### File Upload System
**Purpose**: Attachment support for chat messages

**Supported Formats**:
- Images: PNG, JPG, GIF, WebP
- Documents: PDF, TXT, MD
- Code files: JS, TS, PY, etc.

**Implementation**:
- Drag-and-drop interface
- Progress indicators
- File size validation
- Preview generation
- Secure upload to backend

### Caching Intelligence Display
**Purpose**: Visual representation of caching efficiency

**Metrics Displayed**:
- Cache hit rate percentage
- Response time comparisons
- Cost savings calculations
- API usage statistics
- Cache efficiency trends

**Visual Elements**:
- Real-time charts with Recharts
- Color-coded indicators (green for cache hits, orange for API calls)
- Animated counters for statistics
- Progress bars for efficiency metrics

## Error Handling & User Experience

### Error Boundaries
**Implementation**: React Error Boundaries for graceful error handling

**Coverage**:
- Component-level error catching
- Fallback UI for broken components
- Error reporting and logging
- User-friendly error messages

### Loading States
**Strategy**: Comprehensive loading state management

**Types**:
- Skeleton loaders for content
- Spinner animations for actions
- Progressive loading for large datasets
- Optimistic updates for better UX

### Accessibility Features
**Compliance**: WCAG 2.1 AA standards

**Features**:
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus management
- ARIA labels and descriptions

## Security Considerations

### Client-Side Security
**Measures**:
- Input sanitization and validation
- XSS prevention
- CSRF protection
- Secure token storage
- API key protection (demo only)

**Best Practices**:
- No sensitive data in localStorage
- Secure HTTP headers
- Content Security Policy
- Regular dependency updates

### Data Protection
**Privacy**:
- Minimal data collection
- Secure data transmission
- User consent management
- Data retention policies
- GDPR compliance features

## Performance Optimization

### Bundle Optimization
**Techniques**:
- Code splitting with Next.js
- Dynamic imports for large components
- Tree shaking for unused code
- Bundle analysis and monitoring

**Results**:
- Initial bundle size: ~200KB gzipped
- First Contentful Paint: <1.5s
- Time to Interactive: <3s
- Lighthouse score: 95+

### Runtime Performance
**Optimizations**:
- React.memo for expensive components
- useMemo and useCallback for computations
- Virtual scrolling for large lists
- Debounced search inputs
- Efficient re-rendering strategies

### Caching Strategy
**Client-Side Caching**:
- TanStack Query for API responses
- Browser cache for static assets
- Service worker for offline support
- IndexedDB for large datasets

## Deployment & Production

### Build Process
**Steps**:
1. TypeScript compilation
2. Bundle optimization
3. Asset optimization
4. Static generation
5. Production build verification

**Configuration**:
```javascript
// next.config.js
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};
```

### Environment Management
**Environments**:
- Development: Local development with hot reload
- Staging: Pre-production testing environment
- Production: Live application deployment

**Configuration**:
- Environment-specific API URLs
- Feature flags for gradual rollouts
- Monitoring and analytics integration
- Error tracking and reporting

### Monitoring & Analytics
**Tools**:
- Performance monitoring
- Error tracking
- User analytics
- API usage metrics
- Real-time dashboards

## Troubleshooting Guide

### Common Issues

#### Theme Toggle Not Working
**Symptoms**: Theme toggle buttons visible but not functional
**Solution**: Ensure correct import from custom theme provider
```typescript
// Correct import
import { useTheme } from '@/lib/providers/theme-provider';
// Not: import { useTheme } from 'next-themes';
```

#### API Connection Issues
**Symptoms**: Failed to fetch data, 404 errors
**Solution**: Check API URL configuration in `.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:8001
```

#### Build Errors
**Symptoms**: TypeScript compilation errors
**Solution**: Run type checking and fix issues
```bash
npm run type-check
```

#### Performance Issues
**Symptoms**: Slow page loads, laggy interactions
**Solutions**:
- Check bundle size with `npm run build`
- Analyze with React DevTools Profiler
- Optimize heavy components with React.memo

### Development Tips

#### Hot Reload Issues
**Solution**: Clear Next.js cache
```bash
rm -rf .next
npm run dev
```

#### State Management Debugging
**Tools**:
- Zustand DevTools for store inspection
- React DevTools for component state
- Redux DevTools for complex state debugging

#### API Testing
**Tools**:
- Browser DevTools Network tab
- Postman for API endpoint testing
- Mock Service Worker for testing

## Future Enhancements

### Planned Features
1. **Real-time Collaboration**: Multi-user chat sessions
2. **Advanced Analytics**: Detailed usage insights
3. **Plugin System**: Extensible functionality
4. **Mobile App**: React Native implementation
5. **Offline Support**: Progressive Web App features

### Technical Improvements
1. **Micro-frontends**: Modular architecture
2. **GraphQL Integration**: Efficient data fetching
3. **Advanced Caching**: Service worker implementation
4. **AI Features**: Smart suggestions and auto-completion
5. **Internationalization**: Multi-language support

---

## Appendix

### Useful Commands
```bash
# Development
npm run dev                    # Start development server
npm run build                  # Build for production
npm run start                  # Start production server
npm run lint                   # Run linting
npm run type-check            # TypeScript checking

# Testing
npm test                      # Run tests
npm run test:watch           # Watch mode testing
npm run test:coverage        # Coverage report

# Maintenance
npm audit                    # Security audit
npm update                   # Update dependencies
npm run clean               # Clean build artifacts
```

### Key Dependencies
```json
{
  "next": "14.0.3",
  "react": "18.2.0",
  "typescript": "5.2.2",
  "tailwindcss": "3.3.5",
  "framer-motion": "10.16.5",
  "zustand": "4.4.7",
  "@tanstack/react-query": "4.36.1",
  "react-hook-form": "7.47.0",
  "zod": "3.22.0"
}
```

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Contributing Guidelines
1. Follow TypeScript strict mode
2. Use Prettier for code formatting
3. Write tests for new features
4. Update documentation
5. Follow conventional commit messages

---

*This comprehensive documentation covers all aspects of the PromptCache AI frontend application. For questions or contributions, please refer to the project repository and issue tracker.*

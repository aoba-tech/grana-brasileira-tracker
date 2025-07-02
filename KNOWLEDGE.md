
# KNOWLEDGE.md - Pila Personal Finance App

## 📋 Project Overview

**Pila** is a modern personal finance management application built with React and TypeScript. It provides users with comprehensive tools to track expenses, manage budgets, categorize transactions, and analyze financial data through interactive dashboards and reports.

### Key Features
- ✅ Transaction management (income/expenses)
- ✅ Category-based organization
- ✅ Account management
- ✅ Budget tracking and monitoring
- ✅ Interactive dashboard with charts
- ✅ Data import from OFX files
- ✅ Dark/Light theme support
- ✅ Responsive design
- ✅ Offline-first with IndexedDB
- ✅ Brazilian Portuguese localization

## 🏗️ Technology Stack

### Core Technologies
- **React 18** - UI framework
- **TypeScript** - Type safety and development experience
- **Vite** - Build tool and development server
- **React Router DOM** - Client-side routing

### UI & Styling
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/UI** - Pre-built component library
- **Lucide React** - Icon library
- **Recharts** - Chart and visualization library

### State Management & Data
- **React Context API** - Global state management
- **TanStack Query** - Server state management
- **IndexedDB** - Client-side database (via idb library)

### Development & Testing
- **Vitest** - Testing framework
- **Testing Library** - Component testing utilities
- **ESLint** - Code linting
- **PostCSS** - CSS processing

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Shadcn/UI components
│   ├── transactions/    # Transaction-specific components
│   └── *.tsx           # General components
├── pages/              # Route-based page components
├── hooks/              # Custom React hooks
├── context/            # React Context providers
├── lib/                # Utility libraries
│   ├── db/             # Database operations
│   ├── importers/      # File import logic
│   └── utils/          # Helper functions
├── tests/              # Test files
└── types/              # TypeScript type definitions
```

## 🗄️ Database Schema (IndexedDB)

### Categories Table
```typescript
{
  id: number (auto-increment)
  name: string
  color: string (hex color)
  icon: string (lucide icon name)
  type: 'expense' | 'income'
  createdAt: Date
}
```

### Transactions Table
```typescript
{
  id: number (auto-increment)
  description: string
  amount: number
  type: 'expense' | 'income'
  date: Date
  categoryId: number
  accountId: number
  notes?: string
  createdAt: Date
}
```

### Accounts Table
```typescript
{
  id: number (auto-increment)
  name: string
  type: 'checking' | 'savings' | 'credit' | 'investment' | 'other'
  balance: number
  color: string (hex color)
  icon: string (lucide icon name)
  createdAt: Date
}
```

### Budgets Table
```typescript
{
  id: number (auto-increment)
  categoryId: number
  amount: number
  spent: number
  period: 'monthly' | 'yearly'
  startDate: Date
  endDate: Date
  createdAt: Date
}
```

## 🎨 Design System

### Color Palette
- **Primary Green**: `#00A86B` (success, income)
- **Primary Red**: `#E53935` (danger, expenses)
- **Primary Blue**: `#1A73E8` (information)
- **Warning Yellow**: `#FFC107`
- **Purple**: `#6200EA`

### Typography
- Uses system fonts with Tailwind's default font stack
- Responsive text sizing with `text-sm`, `text-base`, `text-lg`, etc.

### Component Patterns
- Consistent spacing using Tailwind's spacing scale
- Rounded corners (`rounded-lg`, `rounded-md`)
- Shadow system (`shadow-sm`, `shadow-md`)
- Hover states and transitions

## 🌍 Localization (Brazilian Portuguese)

### Currency Formatting
- Format: `R$ 1.234,56`
- Implementation: `src/lib/locale.ts`

### Date Formatting
- Portuguese month names
- DD/MM/YYYY format
- Implemented via `date-fns` library

### UI Text
- All interface text in Brazilian Portuguese
- Consistent terminology for financial concepts

## 📊 Key Components & Features

### Dashboard (`src/pages/Dashboard.tsx`)
- **Stats Cards**: Total balance, monthly income/expenses
- **Pie Chart**: Expenses by category
- **Recent Transactions**: Last 5 transactions
- **Budget Progress**: Visual budget tracking
- **Monthly Navigation**: Switch between months

### Transaction Management
- **Transaction Form**: Add/edit transactions with validation
- **Transaction Table**: Sortable, filterable transaction list
- **Import Dialog**: OFX file import functionality
- **Search & Filters**: Real-time transaction filtering

### Category Management (`src/pages/Categories.tsx`)
- **Category Creation**: Custom categories with colors and icons
- **Type Separation**: Income vs expense categories
- **Default Categories**: Pre-populated system categories
- **Category Badges**: Visual category representation

### Account Management
- **Multi-Account Support**: Different account types
- **Balance Tracking**: Automatic balance calculations
- **Account Icons**: Visual account identification

### Budget System
- **Category Budgets**: Set spending limits per category
- **Progress Tracking**: Visual progress indicators
- **Period Support**: Monthly and yearly budgets
- **Overspend Alerts**: Visual warnings for budget overruns

## 🔄 Data Flow Architecture

### Global State Management
```
FinanceContext
├── useFinanceData (data fetching)
├── useTransactionOperations (CRUD)
├── useCategoryOperations (CRUD)
├── useAccountOperations (CRUD)
└── useBudgetOperations (CRUD)
```

### Database Operations Flow
1. **Initialize DB**: Create object stores and default data
2. **CRUD Operations**: Add/Update/Delete with automatic balance updates
3. **Analytics**: Real-time calculations for dashboards
4. **Data Refresh**: Context-based data synchronization

### Component Communication
- **Context**: Global state sharing
- **Props**: Parent-child communication
- **Callbacks**: Event handling and data updates

## 🎯 Core Hooks

### `useFinanceData`
- Manages all financial data loading
- Provides categories, transactions, accounts, budgets
- Handles monthly data calculations
- Manages loading states

### `useTransactionOperations`
- CRUD operations for transactions
- Automatic account balance updates
- Budget spent amount tracking
- Toast notifications for success/error

### `useTheme`
- Dark/light theme switching
- System preference detection
- LocalStorage persistence

## 📁 File Import System

### OFX Parser (`src/lib/importers/ofx-parser.ts`)
- Parses OFX (Open Financial Exchange) files
- Extracts transaction data
- Handles different OFX formats
- Error handling for malformed files

### Import Process
1. **File Selection**: User chooses OFX file
2. **Parsing**: Extract transaction data
3. **Mapping**: Map to internal transaction format
4. **Preview**: Show transactions before import
5. **Import**: Save to database with category assignment

## ⚙️ Configuration & Settings

### Theme Configuration
- System theme detection
- Manual theme switching
- LocalStorage persistence
- CSS custom properties for colors

### Database Configuration
- IndexedDB initialization
- Migration system for schema updates
- Default data population
- Error handling and recovery

## 🧪 Testing Strategy

### Test Structure
- **Unit Tests**: Individual function testing
- **Component Tests**: React component behavior
- **Hook Tests**: Custom hook functionality
- **Database Tests**: IndexedDB operations

### Testing Tools
- **Vitest**: Test runner and framework
- **Testing Library**: Component testing utilities
- **Fake IndexedDB**: Mock database for tests
- **Fetch Mock**: API mocking

### Test Coverage Areas
- Database CRUD operations
- Hook functionality
- Component rendering
- File import/export
- Utility functions

## 🚀 Deployment & Build

### Build Configuration
- **Vite**: Modern build tool with optimizations
- **TypeScript**: Type checking during build
- **PostCSS**: CSS processing and prefixing
- **Asset Optimization**: Image and bundle optimization

### Environment Setup
- Development server with hot reloading
- Production build with minification
- TypeScript strict mode enabled
- ESLint code quality checks

## 🔐 Security Considerations

### Data Protection
- **Client-Side Only**: No server-side data transmission
- **IndexedDB**: Secure local storage
- **No External APIs**: Offline-first approach
- **Input Validation**: Form data sanitization

### Privacy
- **Local Data**: All data stays on user's device
- **No Tracking**: No analytics or tracking scripts
- **No Authentication**: Simple, privacy-first approach

## 📋 Development Conventions

### Code Style
- **TypeScript**: Strict mode enabled
- **ESLint**: Consistent code formatting
- **Naming**: camelCase for variables, PascalCase for components
- **File Organization**: Feature-based folder structure

### Component Patterns
- **Functional Components**: React hooks pattern
- **Props Interface**: TypeScript interfaces for props
- **Default Props**: Default values for optional props
- **Error Boundaries**: Error handling in components

### Database Patterns
- **Async/Await**: Promise-based database operations
- **Transaction Safety**: Atomic operations where needed
- **Error Handling**: Try-catch blocks with user feedback
- **Data Validation**: Input validation before database operations

## 🔧 Available Scripts

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run test suite
npm run lint         # Run ESLint
```

### Dependencies Management
- **Production**: Core runtime dependencies
- **Development**: Build tools and testing utilities
- **Peer Dependencies**: React ecosystem compatibility

## 🗺️ Roadmap & Future Enhancements

### Planned Features
- [ ] Export functionality (CSV, PDF reports)
- [ ] Advanced filtering and search
- [ ] Recurring transaction templates
- [ ] Goal setting and tracking
- [ ] Multi-currency support
- [ ] Data backup/restore
- [ ] Advanced analytics and insights
- [ ] Mobile PWA optimization

### Technical Improvements
- [ ] Performance optimization for large datasets
- [ ] Advanced caching strategies
- [ ] Improved accessibility (WCAG compliance)
- [ ] Enhanced error handling and user feedback
- [ ] Automated testing coverage expansion
- [ ] Code splitting for better performance

### UI/UX Enhancements
- [ ] Advanced data visualization options
- [ ] Customizable dashboard widgets
- [ ] Improved mobile experience
- [ ] Keyboard shortcuts and accessibility
- [ ] Enhanced onboarding experience

## 🐛 Troubleshooting

### Common Issues
1. **Database Initialization**: Clear IndexedDB if corruption occurs
2. **Theme Persistence**: Check localStorage for theme conflicts
3. **Import Errors**: Validate OFX file format
4. **Performance**: Monitor transaction count for large datasets

### Debug Tools
- Browser DevTools for database inspection
- Console logging for operation tracking
- React DevTools for component debugging
- Network tab for import/export monitoring

## 📚 Additional Resources

### Documentation Links
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Shadcn/UI Components](https://ui.shadcn.com/)
- [IndexedDB API](https://developer.mozilla.org/en-US/Web-APIs/IndexedDB_API)

### Development Guidelines
- Follow React best practices and patterns
- Maintain TypeScript strict mode compliance
- Ensure responsive design for all components
- Implement proper error handling and user feedback
- Write tests for new features and bug fixes
- Keep components focused and reusable
- Document complex business logic
- Maintain consistent code style and formatting

---

**Last Updated**: January 2025
**Version**: 1.0.0
**Maintainer**: Development Team

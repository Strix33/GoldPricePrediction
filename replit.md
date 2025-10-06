# GoldPredict - AI-Powered Gold Price Predictions

## Overview

GoldPredict is a web application that provides AI-powered gold price predictions using machine learning. The application combines a Next.js frontend with a Python-based LSTM (Long Short-Term Memory) neural network for forecasting gold prices. Users can input investment amounts, target dates, and historical price data to receive predictions with confidence metrics, risk assessments, and actionable trading recommendations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Styling**
- Built with Next.js 14 using the App Router architecture
- React Server Components (RSC) enabled for improved performance
- TypeScript for type safety across the application
- Tailwind CSS with custom design tokens using OKLCH color space for consistent theming
- shadcn/ui component library (New York style variant) for pre-built, accessible UI components

**Component Structure**
- Main dashboard component (`gold-prediction-dashboard.tsx`) orchestrates user interactions
- Separate visualization components for charts (`gold-price-chart.tsx`) and results (`prediction-results.tsx`)
- Reusable UI primitives built on Radix UI primitives for accessibility
- Custom hooks for mobile detection and toast notifications

**State Management**
- Local component state using React hooks (useState, useEffect, useMemo)
- No global state management library - state is colocated with components
- Form data managed through controlled inputs

**Data Visualization**
- Recharts library for rendering interactive area charts
- Custom chart configuration with theming support
- Dynamic Y-axis scaling based on price ranges

### Backend Architecture

**Machine Learning Model**
- LSTM neural network implemented with TensorFlow/Keras
- Model trained on historical gold price data from CSV files
- MinMaxScaler for data normalization (persisted via pickle)
- Sequence-based prediction using 60-day lookback windows
- Model persistence for reuse across predictions

**Data Processing**
- CSV parsing for historical price data
- Date-based sorting and validation
- Sequence generation for time-series analysis
- Pandas for data manipulation

**Prediction Pipeline**
1. Load and normalize historical price data
2. Create sliding window sequences (60 days)
3. Feed sequences into trained LSTM model
4. Denormalize predictions back to actual price values
5. Calculate confidence metrics and risk levels

### External Dependencies

**Frontend Libraries**
- **@radix-ui/*** - Unstyled, accessible UI component primitives (accordion, dialog, dropdown, select, etc.)
- **@vercel/analytics** - Web analytics integration
- **recharts** - Composable charting library for data visualization
- **react-hook-form** - Form state management and validation
- **@hookform/resolvers** - Validation schema resolvers
- **zod** (implied by resolvers) - TypeScript-first schema validation
- **date-fns** - Date manipulation and formatting
- **lucide-react** - Icon library
- **class-variance-authority** - Variant-based component styling
- **clsx** & **tailwind-merge** - Conditional className utilities
- **cmdk** - Command palette component
- **embla-carousel-react** - Carousel/slider functionality
- **input-otp** - OTP input component
- **vaul** - Drawer component implementation
- **next-themes** - Theme management (light/dark mode)

**Machine Learning Stack**
- **TensorFlow/Keras** - Deep learning framework for LSTM model
- **NumPy** - Numerical computing and array operations
- **Pandas** - Data manipulation and CSV processing
- **scikit-learn** - Data preprocessing (MinMaxScaler) and metrics
- **Matplotlib** - Chart generation for model evaluation

**Development Tools**
- **TypeScript** - Static type checking
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

**Data Storage**
- CSV files for historical gold price data
- Pickle files for persisting trained scalers
- Trained model files (implied by `load_model` usage)
- No database system currently implemented

**Hosting & Deployment**
- Migrated from Vercel to Replit (October 6, 2025)
- Configured for Replit autoscale deployment
- Development server: `pnpm run dev` on port 5000, bound to 0.0.0.0
- Production server: `pnpm run start` on port 5000, bound to 0.0.0.0
- Package manager: pnpm (detected from pnpm-lock.yaml)
- Build command: `pnpm run build`
- @vercel/analytics retained (runs in debug mode in development)
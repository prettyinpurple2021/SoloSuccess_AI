"use client";

import { logger, logError, logWarn, logInfo, logDebug, logApi, logDb, logAuth } from '@/lib/logger'
import React, { ErrorInfo } from 'react';
import { Button} from './button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from './card';
import { AlertCircle, Home, RefreshCw} from 'lucide-react';


interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logError('Error caught by ErrorBoundary:', error, errorInfo);
    // You could log the error to a service here
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-dark-bg">
          <Card className="w-full max-w-lg border-2 border-neon-magenta shadow-[0_0_30px_rgba(255,0,110,0.3)]">
            <CardHeader>
              <div className="flex items-center gap-2 text-neon-magenta mb-2">
                <AlertCircle className="h-6 w-6" />
                <CardTitle className="text-neon-magenta">Something went wrong</CardTitle>
              </div>
              <CardDescription>
                We&apos;ve encountered an unexpected error. Our team has been notified.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-dark-bg p-4 rounded-sm border-2 border-gray-700 text-sm font-mono text-gray-400 overflow-auto max-h-40">
                {this.state.error?.message || "Unknown error"}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between gap-2">
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/'}
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Go Home
              </Button>
              <Button 
                variant="cyan"
                onClick={() => window.location.reload()}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

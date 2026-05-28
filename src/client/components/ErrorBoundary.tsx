'use client';

import { AlertOctagon } from 'lucide-react';
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    // Here we could also log to Sentry
    // Sentry.captureException(error);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6 glass-panel rounded-3xl m-6">
          <div className="p-4 rounded-full bg-danger/15 text-danger mb-4">
            <AlertOctagon className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
          <p className="text-muted text-sm text-center max-w-md mb-6">
            We encountered an unexpected error while rendering this component. Our team has been notified.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-6 py-2 bg-white/10 hover:bg-white/20 transition rounded-xl text-sm font-semibold text-white"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

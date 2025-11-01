import React, { Component, ErrorInfo, ReactNode } from "react";

interface AppErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error | null, reset: () => void) => ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface AppErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

const defaultFallback = (error: Error | null, reset: () => void) => (
  <div className="mx-auto max-w-md rounded-lg border border-red-200 bg-white p-6 text-center shadow">
    <p className="text-sm font-semibold text-red-600">Something went wrong</p>
    <p className="mt-2 text-xs text-red-500">
      {error?.message ||
        "An unexpected error occurred while rendering this view."}
    </p>
    <button
      type="button"
      onClick={reset}
      className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm text-white transition hover:bg-blue-700"
    >
      Try again
    </button>
  </div>
);

export default class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("AppErrorBoundary caught an error", error, info);
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      const Fallback = fallback ?? defaultFallback;
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
          {Fallback(error, this.reset)}
        </div>
      );
    }

    return <>{children}</>;
  }
}

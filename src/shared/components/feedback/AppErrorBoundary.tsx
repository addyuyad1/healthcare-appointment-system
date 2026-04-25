import type { PropsWithChildren, ReactNode } from "react";
import { Component } from "react";
import { captureError } from "../../../services/monitoring";
import { Button } from "../ui/Button";

interface AppErrorBoundaryProps {
  fallback?: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<
  PropsWithChildren<AppErrorBoundaryProps>,
  AppErrorBoundaryState
> {
  constructor(props: PropsWithChildren<AppErrorBoundaryProps>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    captureError(error, { boundary: "AppErrorBoundary" });
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex min-h-screen items-center justify-center px-4">
            <div className="panel max-w-lg p-8 text-center">
              <span className="eyebrow">Unexpected Error</span>
              <h1 className="mt-4 text-3xl font-semibold text-slate-950">
                Something went wrong
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                The error has been logged. Refresh the page to retry the last action.
              </p>
              <Button
                className="mt-6"
                variant="secondary"
                onClick={() => window.location.reload()}
              >
                Reload application
              </Button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

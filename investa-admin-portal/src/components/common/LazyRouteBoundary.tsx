import React from 'react';
import { LazyModuleError } from './EnterpriseStates';

interface LazyRouteBoundaryProps {
  children: React.ReactNode;
}

interface LazyRouteBoundaryState {
  hasError: boolean;
}

export class LazyRouteBoundary extends React.Component<LazyRouteBoundaryProps, LazyRouteBoundaryState> {
  public state: LazyRouteBoundaryState = { hasError: false };

  public static getDerivedStateFromError(): LazyRouteBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(): void {
    // Keep chunk failures actionable without exposing a raw stack trace in the shell.
    console.warn('Company Management route module failed to load.');
  }

  private handleRetry = (): void => {
    window.location.reload();
  };

  public render(): React.ReactNode {
    if (this.state.hasError) {
      return <LazyModuleError onRetry={this.handleRetry} />;
    }

    return this.props.children;
  }
}

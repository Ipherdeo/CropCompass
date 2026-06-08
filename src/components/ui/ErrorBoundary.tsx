import { Component, type ErrorInfo, type ReactNode } from "react";
import { T } from "../../styles/tokens";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("CropCompass render error", { error, componentStack: info.componentStack });
  }

  render() {
    if (this.state.hasError) return (
      <div role="alert" style={{
        padding: 24,
        border: `1px solid ${T.redBorder}`,
        borderRadius: 12,
        background: T.redBg,
        color: T.red,
        lineHeight: 1.5,
      }}>
        CropCompass could not render this result. Adjust the inputs and try again.
      </div>
    );
    return this.props.children;
  }
}

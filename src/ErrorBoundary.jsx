import React from "react";

/**
 * ErrorBoundary — catches render-time exceptions in the subtree and shows a
 * friendly fallback instead of a blank screen.  Wrap any major section:
 *
 *   <ErrorBoundary label="Dice Roller">
 *     <DiceRoller />
 *   </ErrorBoundary>
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || "Unknown error" };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info);
  }

  reset = () => this.setState({ hasError: false, message: "" });

  render() {
    if (this.state.hasError) {
      const label = this.props.label || "This section";
      return (
        <div className="flex flex-col items-center justify-center gap-4 p-10 text-center">
          <div className="text-3xl">⚠️</div>
          <p className="text-neutral-300 font-bold">{label} encountered an error.</p>
          <p className="text-neutral-600 text-xs font-mono">{this.state.message}</p>
          <button
            onClick={this.reset}
            className="mt-2 px-5 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

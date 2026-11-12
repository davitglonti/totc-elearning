import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-poppins">
          <div className="max-w-lg w-full bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-gray-100 text-center space-y-6 animate-in fade-in zoom-in-95">
            <div className="w-20 h-20 rounded-full bg-rose-50 text-rose-500 border border-rose-100 flex items-center justify-center mx-auto shadow-sm">
              <AlertTriangle className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-totc-navy tracking-tight">
                Something went wrong
              </h2>
              <p className="text-sm text-totc-gray leading-relaxed">
                An unexpected interface error occurred. You can reload the page or return to the home screen.
              </p>
            </div>

            {this.state.error && (
              <div className="p-4 bg-slate-900 rounded-2xl text-left overflow-x-auto text-xs font-mono text-emerald-400 max-h-36">
                <span className="text-rose-400 font-bold block mb-1">
                  {this.state.error.toString()}
                </span>
                {this.state.errorInfo?.componentStack && (
                  <pre className="text-slate-400 text-[10px] whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack.slice(0, 300)}...
                  </pre>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-totc-teal hover:bg-totc-teal-dark text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>

              <button
                onClick={this.handleGoHome}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-gray-100 hover:bg-gray-200 text-totc-navy font-bold text-xs transition-all flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                <span>Back to Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

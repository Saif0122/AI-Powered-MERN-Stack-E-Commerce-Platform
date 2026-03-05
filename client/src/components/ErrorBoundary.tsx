import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        console.debug('[Stack Trace]:', error.stack);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
                    <div className="bg-white p-8 rounded-3xl shadow-xl max-w-lg w-full text-center border border-slate-100">
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-black">
                            !
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">
                            {this.state.error?.message?.includes('unauthenticated')
                                ? 'Session Expired'
                                : 'Something went wrong.'}
                        </h1>
                        <p className="text-slate-500 mb-8 whitespace-pre-wrap text-sm text-center">
                            {this.state.error?.message?.includes('network')
                                ? 'We are having trouble connecting to the server. Check your internet connection.'
                                : this.state.error?.message || 'An unexpected error occurred in the application.'}
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-3 rounded-xl font-bold transition-all w-full shadow-lg shadow-brand-500/30"
                            >
                                Retry
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-8 py-3 rounded-xl font-bold transition-all w-full"
                            >
                                Return to Home
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

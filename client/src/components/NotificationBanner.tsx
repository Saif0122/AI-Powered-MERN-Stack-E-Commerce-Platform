import React from 'react';
import { Link } from 'react-router-dom';
import type { ErrorKind } from '../services/axiosWrapper';

interface BannerProps {
    kind: ErrorKind | 'none';
}

const NotificationBanner: React.FC<BannerProps> = ({ kind }) => {
    if (kind === 'none' || kind === 'client' || kind === 'ignore') return null;

    if (kind === 'unauthenticated') {
        return (
            <div className="bg-amber-100 text-amber-900 text-center py-2 px-4 shadow-sm z-40 sticky top-0 border-b border-amber-200 text-sm font-medium">
                You are viewing the guest version of the site.
                <Link to="/auth/login" className="ml-3 text-brand-600 font-bold hover:underline">
                    Sign in
                </Link>
                {' '}for a personalized experience.
            </div>
        );
    }

    return (
        <div className="bg-red-600 text-white text-center py-3 font-bold shadow-md z-50 sticky top-0 animate-pulse">
            ⚠️ {kind === 'network' ? 'Cannot connect to the server.' : 'Server is currently experiencing issues.'}
            <button
                className="ml-4 underline text-white/80 hover:text-white cursor-pointer"
                onClick={() => window.location.reload()}
            >
                Retry
            </button>
        </div>
    );
};

export default NotificationBanner;

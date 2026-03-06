import React, { createContext, useContext, useRef, useEffect, type ReactNode } from 'react';
import LoadingBar, { type LoadingBarRef } from 'react-top-loading-bar';

interface LoadingContextType {
    start: () => void;
    complete: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const loadingBarRef = useRef<LoadingBarRef>(null);

    const start = () => {
        loadingBarRef.current?.continuousStart();
    };

    const complete = () => {
        loadingBarRef.current?.complete();
    };

    useEffect(() => {
        const handleLoading = (e: any) => {
            if (e.detail?.type === 'start') start();
            if (e.detail?.type === 'complete') complete();
        };

        window.addEventListener('api-loading', handleLoading);
        return () => window.removeEventListener('api-loading', handleLoading);
    }, []);

    return (
        <LoadingContext.Provider value={{ start, complete }}>
            <LoadingBar
                color="#2563eb" // brand-600
                ref={loadingBarRef}
                shadow={true}
                height={3}
            />
            {children}
        </LoadingContext.Provider>
    );
};

export const useLoading = () => {
    const context = useContext(LoadingContext);
    if (!context) {
        throw new Error('useLoading must be used within a LoadingProvider');
    }
    return context;
};

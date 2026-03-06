import React from 'react';

interface SkeletonProps {
    className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => (
    <div className={`animate-pulse bg-slate-200 rounded ${className}`}></div>
);

export const ProductCardSkeleton: React.FC = () => (
    <div className="bg-white border border-slate-100 p-4 rounded-3xl shadow-sm flex flex-col h-full">
        <Skeleton className="aspect-square rounded-2xl mb-4" />
        <div className="flex-grow space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="mt-4 flex items-center justify-between">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-10 w-10 rounded-xl" />
        </div>
    </div>
);

export const CategorySkeleton: React.FC = () => (
    <div className="bg-white border border-slate-100 p-6 rounded-3xl text-center">
        <Skeleton className="w-16 h-16 rounded-2xl mx-auto mb-4" />
        <Skeleton className="h-5 w-20 mx-auto" />
    </div>
);

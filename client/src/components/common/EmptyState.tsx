import React from 'react';
import { Link } from 'react-router-dom';
import { type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionText?: string;
    actionLink?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    icon: Icon,
    title,
    description,
    actionText,
    actionLink,
}) => {
    return (
        <div className="flex flex-col items-center justify-center py-32 px-4 text-center relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-400/5 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="relative z-10">
                <div className="w-32 h-32 bg-white rounded-[2.5rem] flex items-center justify-center mb-10 text-slate-200 shadow-2xl shadow-slate-200/50 border border-slate-50 group transition-all hover:scale-110 duration-500">
                    <Icon size={56} strokeWidth={1} className="text-slate-300 group-hover:text-brand-600 transition-colors" />
                </div>

                <h3 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">{title}</h3>
                <p className="text-slate-400 max-w-md mb-12 leading-relaxed text-lg font-medium italic">
                    {description}
                </p>

                {actionText && actionLink && (
                    <Link
                        to={actionLink}
                        className="inline-flex items-center justify-center bg-slate-900 hover:bg-brand-600 text-white px-10 py-4 rounded-[1.5rem] font-black transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-slate-900/10"
                    >
                        {actionText}
                    </Link>
                )}
            </div>
        </div>
    );
};

export default EmptyState;

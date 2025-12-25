export const Loader = ({ className }: { className?: string }) => {
    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div className="relative">
                <div className="h-12 w-12 rounded-full border-4 border-zinc-200 dark:border-zinc-800"></div>
                <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
            </div>
        </div>
    );
};

export const PageLoader = ({ text = "Loading..." }: { text?: string }) => {
    return (
        <div className="min-h-[400px] flex flex-col items-center justify-center gap-4 animate-in fade-in duration-500">
            <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-zinc-100 dark:border-zinc-800"></div>
                <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium animate-pulse">{text}</p>
        </div>
    );
};

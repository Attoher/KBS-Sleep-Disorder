import React from 'react';

/**
 * LoadingSpinner Component
 * Premium loading animation with lavender theme
 */
const LoadingSpinner = ({
    size = 'md',
    text = 'Loading...',
    fullScreen = false,
    className = ''
}) => {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
        xl: 'w-24 h-24'
    };

    const Spinner = () => (
        <div className="relative">
            {/* Outer ring */}
            <div className={`${sizeClasses[size]} rounded-full border-4 border-accent-primary/20`} />

            {/* Spinning gradient ring */}
            <div className={`${sizeClasses[size]} absolute top-0 left-0 rounded-full border-4 border-transparent border-t-accent-primary border-r-accent-secondary animate-spin`} />

            {/* Inner pulsing dot */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-accent-primary rounded-full animate-pulse-glow" />
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center app-bg backdrop-blur-sm">
                <div className="text-center">
                    <Spinner />
                    {text && (
                        <p className="mt-6 text-lg font-medium text-primary animate-pulse">
                            {text}
                        </p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            <Spinner />
            {text && (
                <p className="mt-4 text-sm font-medium text-secondary animate-pulse">
                    {text}
                </p>
            )}
        </div>
    );
};

export default LoadingSpinner;

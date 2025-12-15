import React from 'react';
import { Inbox, FileQuestion, AlertCircle, Search, Moon } from 'lucide-react';
import Button from './Button';

/**
 * EmptyState Component
 * Beautiful empty state component for various scenarios
 */
const EmptyState = ({
    type = 'default', // 'default', 'analytics', 'search', 'error'
    title,
    description,
    icon: CustomIcon,
    action,
    actionLabel,
    className = ''
}) => {
    // Default icons based on type
    const defaultIcons = {
        default: Inbox,
        analytics: Moon,
        search: Search,
        error: AlertCircle
    };

    const Icon = CustomIcon || defaultIcons[type] || defaultIcons.default;

    // Default messages based on type
    const defaultMessages = {
        analytics: {
            title: "You haven't done any assignment",
            description: "Complete your first sleep screening to see analytics and insights about your sleep patterns."
        },
        search: {
            title: 'No results found',
            description: 'Try adjusting your search or filters to find what you\'re looking for.'
        },
        error: {
            title: 'Something went wrong',
            description: 'We encountered an error while loading this content. Please try again.'
        },
        default: {
            title: 'No data available',
            description: 'There\'s nothing here yet. Start by adding some content.'
        }
    };

    const finalTitle = title || defaultMessages[type]?.title || defaultMessages.default.title;
    const finalDescription = description || defaultMessages[type]?.description || defaultMessages.default.description;

    return (
        <div className={`flex flex-col items-center justify-center text-center py-16 px-6 ${className}`}>
            {/* Animated Icon Container */}
            <div className="relative mb-8">
                {/* Background glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 rounded-full blur-2xl scale-150 animate-pulse-glow" />

                {/* Icon */}
                <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-accent-primary/10 to-accent-secondary/10 border-2 border-accent-primary/20 flex items-center justify-center backdrop-blur-sm animate-float">
                    <Icon className="w-12 h-12 text-accent-primary" strokeWidth={1.5} />
                </div>
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-primary mb-3">
                {finalTitle}
            </h3>

            {/* Description */}
            <p className="text-secondary/80 max-w-md mb-8 leading-relaxed">
                {finalDescription}
            </p>

            {/* Action Button */}
            {action && actionLabel && (
                <Button
                    onClick={action}
                    variant="primary"
                    size="large"
                    className="px-8 py-3 rounded-xl shadow-lg shadow-accent-primary/20 hover:shadow-xl hover:shadow-accent-primary/30"
                >
                    {actionLabel}
                </Button>
            )}
        </div>
    );
};

export default EmptyState;

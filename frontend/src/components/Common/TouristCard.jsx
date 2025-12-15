import React from 'react';

/**
 * TouristCard Component
 * Feature card with advanced hover effects inspired by modern web design
 */
const TouristCard = ({
    icon: Icon,
    title,
    description,
    image,
    gradient = 'from-purple-500 to-pink-500',
    className = ''
}) => {
    return (
        <div className={`tourist-card group ${className}`}>
            <div className="relative overflow-hidden h-full">
                {/* Background Image or Gradient */}
                {image ? (
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                        style={{ backgroundImage: `url(${image})` }}
                    />
                ) : (
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-500`} />
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Content */}
                <div className="relative z-10 p-8 h-full flex flex-col justify-between">
                    {/* Icon */}
                    <div className="mb-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 flex items-center justify-center backdrop-blur-sm border border-accent-primary/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                            {Icon && <Icon className="w-8 h-8 text-accent-primary" />}
                        </div>
                    </div>

                    {/* Text Content */}
                    <div className="transform transition-transform duration-500 group-hover:translate-y-0 translate-y-2">
                        <h3 className="text-2xl font-bold text-primary mb-3 group-hover:text-accent-primary transition-colors duration-300">
                            {title}
                        </h3>
                        <p className="text-secondary/80 leading-relaxed opacity-90 group-hover:opacity-100 transition-opacity duration-300">
                            {description}
                        </p>
                    </div>


                </div>
            </div>
        </div>
    );
};

export default TouristCard;

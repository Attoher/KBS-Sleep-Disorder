import React, { useState, useEffect } from 'react';

/**
 * StickyStack Component
 * Creates a sticky stacking effect where cards stack on top of each other during scroll
 */
const StickyStack = ({ items, className = '' }) => {
    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <div className={`relative ${className}`}>
            {items.map((item, index) => {
                const isActive = index === activeIndex;
                const isPast = index < activeIndex;

                return (
                    <div
                        key={index}
                        className="sticky transition-all duration-500 ease-out"
                        style={{
                            top: `${80 + index * 20}px`,
                            zIndex: items.length - index,
                            transform: isPast ? 'scale(0.95)' : 'scale(1)',
                            opacity: isPast ? 0.5 : 1,
                        }}
                        onClick={() => setActiveIndex(index)}
                    >
                        <div className={`surface p-8 rounded-3xl cursor-pointer hover-lift ${isActive ? 'ring-2 ring-accent-primary' : ''
                            }`}>
                            {item.content}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default StickyStack;

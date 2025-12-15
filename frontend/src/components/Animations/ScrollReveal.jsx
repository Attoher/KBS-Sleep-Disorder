import React, { useEffect, useRef, useState } from 'react';

/**
 * ScrollReveal Component
 * Uses Intersection Observer API to trigger animations when elements enter viewport
 */
const ScrollReveal = ({
    children,
    className = '',
    delay = 0,
    threshold = 0.1,
    animation = 'fade-up' // 'fade-up', 'fade-in', 'slide-left', 'slide-right', 'scale'
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const elementRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    // Optionally unobserve after revealing
                    observer.unobserve(entry.target);
                }
            },
            {
                threshold,
                rootMargin: '0px 0px -50px 0px'
            }
        );

        const currentElement = elementRef.current;
        if (currentElement) {
            observer.observe(currentElement);
        }

        return () => {
            if (currentElement) {
                observer.unobserve(currentElement);
            }
        };
    }, [threshold]);

    const getAnimationClass = () => {
        if (!isVisible) return 'scroll-reveal';

        switch (animation) {
            case 'fade-up':
                return 'animate-fade-in-up';
            case 'fade-in':
                return 'animate-fade-in';
            case 'slide-left':
                return 'animate-slide-in-left';
            case 'slide-right':
                return 'animate-slide-in-right';
            case 'scale':
                return 'animate-scale-in';
            default:
                return 'animate-fade-in-up';
        }
    };

    return (
        <div
            ref={elementRef}
            className={`${getAnimationClass()} ${className}`}
            style={{ animationDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
};

export default ScrollReveal;

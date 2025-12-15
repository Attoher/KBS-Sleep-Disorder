import React from 'react';
import { Github, Twitter, Linkedin, Instagram, Facebook, Mail } from 'lucide-react';

/**
 * SocialIcons Component
 * Social media icons with creative hover effects
 */
const SocialIcons = ({ className = '', size = 'md' }) => {
    const socialLinks = [
        { icon: Github, href: 'https://github.com/Attoher/KBS-Sleep-Disorder', label: 'GitHub', color: 'hover:text-purple-400' },
        { icon: Twitter, href: '#', label: 'Twitter', color: 'hover:text-blue-400' },
        { icon: Linkedin, href: '#', label: 'LinkedIn', color: 'hover:text-blue-500' },
        { icon: Instagram, href: '#', label: 'Instagram', color: 'hover:text-pink-400' },
        { icon: Facebook, href: '#', label: 'Facebook', color: 'hover:text-blue-600' },
        { icon: Mail, href: 'mailto:support@kumeowturu.com', label: 'Email', color: 'hover:text-green-400' },
    ];

    const sizeClasses = {
        sm: 'w-5 h-5',
        md: 'w-6 h-6',
        lg: 'w-8 h-8'
    };

    const containerSizeClasses = {
        sm: 'w-10 h-10',
        md: 'w-12 h-12',
        lg: 'w-14 h-14'
    };

    return (
        <div className={`flex items-center gap-4 ${className}`}>
            {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                    <a
                        key={social.label}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative"
                        aria-label={social.label}
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        {/* Animated Background Circle */}
                        <div className={`${containerSizeClasses[size]} rounded-full surface border border-app flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 group-hover:border-accent-primary relative overflow-hidden`}>
                            {/* Gradient overlay on hover */}
                            <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/0 to-accent-secondary/0 group-hover:from-accent-primary/20 group-hover:to-accent-secondary/20 transition-all duration-500 rounded-full" />

                            {/* Icon */}
                            <Icon className={`${sizeClasses[size]} text-secondary transition-all duration-500 ${social.color} relative z-10 group-hover:scale-110`} />

                            {/* Ripple effect */}
                            <div className="absolute inset-0 rounded-full bg-accent-primary/20 scale-0 group-hover:scale-150 opacity-0 group-hover:opacity-100 transition-all duration-700" />
                        </div>

                        {/* Tooltip */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-surface border border-app rounded-lg text-xs font-medium text-primary whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none shadow-lg">
                            {social.label}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-2 h-2 bg-surface border-r border-b border-app rotate-45" />
                        </div>
                    </a>
                );
            })}
        </div>
    );
};

export default SocialIcons;

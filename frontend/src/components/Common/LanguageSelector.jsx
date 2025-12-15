import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const LanguageSelector = () => {
    const { language, changeLanguage } = useLanguage();

    const languages = [
        { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
        { code: 'en', name: 'English', flag: '🇬🇧' },
        { code: 'zh', name: '中文', flag: '🇨🇳' }
    ];

    return (
        <div className="relative group">
            <button className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors border border-gray-700">
                <Globe className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-300">
                    {languages.find(l => l.code === language)?.flag}
                </span>
            </button>

            <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                {languages.map((lang) => (
                    <button
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors flex items-center space-x-3 first:rounded-t-lg last:rounded-b-lg ${language === lang.code ? 'bg-gray-700/50 text-white' : 'text-gray-300'
                            }`}
                    >
                        <span className="text-xl">{lang.flag}</span>
                        <span className="text-sm">{lang.name}</span>
                        {language === lang.code && (
                            <span className="ml-auto text-blue-400">✓</span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default LanguageSelector;

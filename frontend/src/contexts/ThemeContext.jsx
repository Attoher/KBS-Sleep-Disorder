import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const ThemeContext = createContext({
  theme: 'dark',
  toggleTheme: () => {},
  setTheme: () => {}
});

const THEME_KEY = 'theme';

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState('dark');

  // Apply theme to <html data-theme="...">
  const applyTheme = useCallback((nextTheme) => {
    const root = document.documentElement;
    root.dataset.theme = nextTheme;
    setThemeState(nextTheme);
    localStorage.setItem(THEME_KEY, nextTheme);
  }, []);

  const setTheme = useCallback((next) => {
    applyTheme(next);
  }, [applyTheme]);

  const toggleTheme = useCallback(() => {
    applyTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, applyTheme]);

  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') {
      applyTheme(saved);
    } else {
      applyTheme('dark');
    }
  }, [applyTheme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

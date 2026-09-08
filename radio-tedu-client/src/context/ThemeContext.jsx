import React, { createContext, useContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('radiotedu_theme');
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
    return 'dark'; // Varsayılan: Dark mode
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('radiotedu_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const isCurrentDark = theme === 'dark';
    const nextTheme = isCurrentDark ? 'light' : 'dark';
    // Dark -> Light: Soldan Sağa (ltr)
    // Light -> Dark: Sağdan Sola (rtl)
    const direction = isCurrentDark ? 'ltr' : 'rtl';

    document.documentElement.setAttribute('data-theme-direction', direction);

    // Eğer tarayıcı View Transitions API destekliyorsa gerçek sayfa elemanları üzerinde yönlü geçiş yap
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        setTheme(nextTheme);
      });
    } else {
      setTheme(nextTheme);
    }
  };

  const isDark = theme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

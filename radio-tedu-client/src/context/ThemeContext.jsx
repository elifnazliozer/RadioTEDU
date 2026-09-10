import React, { createContext, useContext, useState, useEffect } from 'react';

// koyu ve açık tema yönetimini ve view transitions animasyonlarını sağlayan context
export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('radiotedu_theme');
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
    return 'dark'; // varsayılan: dark mode
  });

  // her tema değiştirlildiğinde html elemanının listesini ve localStorage kaydını günceller
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

  // tema değişimi sırasında yumuşak geçiş efekti yapan fonk
  const toggleTheme = () => {
    const isCurrentDark = theme === 'dark';
    const nextTheme = isCurrentDark ? 'light' : 'dark';
    const direction = isCurrentDark ? 'ltr' : 'rtl';

    document.documentElement.setAttribute('data-theme-direction', direction);

    // view transitions api destekleniyorsa yönlü geçiş yap
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

// themeContext değerlerine kolay erişim sağlayan custom hook
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

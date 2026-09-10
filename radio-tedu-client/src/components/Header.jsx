import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

// üst gezinme barı (header): logo, slogan, dil değiştirici ve tema değiştirici
export default function Header() {
  const { isDark, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="h-16 shrink-0 w-full z-40 border-b border-stone-200 dark:border-stone-800/80 bg-[#fdfbf7]/90 dark:bg-[#120e0c]/90 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between transition-colors duration-300 select-none">
      {/*sol logo ve slogan */}
      <div className="flex items-center gap-3">
        <img
          src={isDark ? "/logo_dark.png" : "/logo_light.png"}
          alt="RadioTEDU"
          className="h-9 sm:h-10 object-contain transition-all duration-300 drop-shadow-sm"
        />
        <span className="text-xs text-stone-600 dark:text-stone-400 font-mono font-medium hidden md:inline-block border-l border-stone-300 dark:border-stone-800 pl-3">
          {t('slogan')}
        </span>
      </div>
      
      {/* sağ dil, tema ve canlı yayın butonları */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 rounded-lg bg-stone-200/80 dark:bg-[#1a1614] border border-stone-300 dark:border-stone-800 shadow-sm text-xs font-bold font-mono">
          <button
            onClick={() => setLanguage('tr')}
            className={`cursor-pointer transition-all duration-200 tracking-wider ${
              language === 'tr'
                ? 'text-red-700 dark:text-red-400 font-black'
                : 'text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
            }`}
            title="Türkçe"
          >
            TR
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`cursor-pointer transition-all duration-200 tracking-wider ${
              language === 'en'
                ? 'text-red-700 dark:text-red-400 font-black'
                : 'text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
            }`}
            title="English"
          >
            EN
          </button>
        </div>

        {/* light / dark mode toggle butonu */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-stone-200/90 dark:bg-[#1a1614] hover:bg-stone-300 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-800 shadow-sm transition-all cursor-pointer active:scale-95 font-mono"
          title={isDark ? "Açık Moda Geç (Nostaljik Krem)" : "Koyu Moda Geç (Koyu Maun Ahşap)"}
          aria-label="Tema Değiştir"
        >
          {isDark ? (
            <>
              <svg className="w-3.5 h-3.5 text-stone-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4"/>
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
              </svg>
              <span className="hidden sm:inline text-[11px]">{t('themeLight')}</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5 text-stone-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
              </svg>
              <span className="hidden sm:inline text-[11px]">{t('themeDark')}</span>
            </>
          )}
        </button>

        {/* canlı yayın rozeti */}
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/30 shadow-sm font-mono">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          {t('liveBadge')}
        </span>
      </div>
    </header>
  );
}

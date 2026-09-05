import React, { useContext, useState } from 'react';
import { AudioContext } from '../context/AudioContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { STATIONS, PODCASTS, LATEST_EPISODES } from '../data/radioData';

export default function ExploreSection() {
  const { isPlaying, isLoading, currentTrack, playTrack } = useContext(AudioContext);
  const { isDark, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'radios', 'podcasts', 'episodes'

  const mainStation = STATIONS[0];
  const subStations = STATIONS.slice(1);

  return (
    <main className="w-full md:w-2/3 h-full overflow-y-auto border-r border-zinc-200 dark:border-gray-800/80 flex flex-col p-6 pb-6 space-y-8 custom-scrollbar bg-zinc-50/50 dark:bg-radio-dark text-zinc-900 dark:text-white transition-colors duration-300">
      {/* Üst Logo, TR/EN Dil Seçici, Tema Değiştirici & Canlı Yayın Rozeti */}
      <header className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <img
            src={isDark ? "/logo_dark.png" : "/logo_light.png"}
            alt="RadioTEDU"
            className="h-10 object-contain transition-all duration-300 drop-shadow-sm"
          />
          <span className="text-xs text-zinc-500 dark:text-gray-400 font-medium hidden sm:inline-block border-l border-zinc-300 dark:border-gray-800 pl-3">
            {t('slogan')}
          </span>
        </div>
        
        <div className="flex items-center gap-2.5">
          {/* TR / EN Dil Seçici (Görseldeki gibi: TR aktifken kırmızı, EN gri) */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-zinc-100/90 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 shadow-sm text-xs select-none font-bold">
            <button
              onClick={() => setLanguage('tr')}
              className={`cursor-pointer transition-all duration-200 tracking-wider ${
                language === 'tr'
                  ? 'text-red-600 dark:text-red-500 font-black'
                  : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
              title="Türkçe"
            >
              TR
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`cursor-pointer transition-all duration-200 tracking-wider ${
                language === 'en'
                  ? 'text-red-600 dark:text-red-500 font-black'
                  : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
              title="English"
            >
              EN
            </button>
          </div>

          {/* Light / Dark Mode Toggle Butonu */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 shadow-sm transition-all cursor-pointer active:scale-95"
            title={isDark ? "Açık Moda Geç" : "Koyu Moda Geç"}
            aria-label="Tema Değiştir"
          >
            {isDark ? (
              <>
                <svg className="w-3.5 h-3.5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4"/>
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
                </svg>
                <span className="hidden sm:inline text-[11px]">{t('themeLight')}</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
                </svg>
                <span className="hidden sm:inline text-[11px]">{t('themeDark')}</span>
              </>
            )}
          </button>

          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-500 border border-red-500/20 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            {t('liveBadge')}
          </span>
        </div>
      </header>

      {/* Hero Banner / Ana İstasyon Vitrini */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-50 via-zinc-50 to-white dark:from-red-950/60 dark:via-zinc-900 dark:to-black border border-red-200/60 dark:border-red-900/30 p-6 md:p-8 shadow-xl shrink-0 transition-colors duration-300">
        <div className="relative z-10 max-w-xl">
          <p className="text-xs uppercase tracking-widest text-red-600 dark:text-red-400 font-bold mb-2">
            {t('heroSubtitle')}
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-3">
            {t('heroTitle1')}<br />
            <span className="text-red-600 dark:text-red-500 italic font-serif">{t('heroTitle2')}</span>
          </h1>
          <p className="text-sm text-zinc-600 dark:text-gray-300 leading-relaxed mb-6">
            {t('heroDesc')}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => playTrack(mainStation)}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-all shadow-lg shadow-red-600/30 cursor-pointer active:scale-95"
            >
              {isLoading && currentTrack.id === mainStation.id ? (
                <svg className="w-4 h-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : isPlaying && currentTrack.id === mainStation.id ? (
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <rect x="6.25" y="5" width="3.5" height="14" rx="1.75" />
                  <rect x="14.25" y="5" width="3.5" height="14" rx="1.75" />
                </svg>
              ) : (
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M8.45 5.25C7.76 4.85 6.95 5.35 6.95 6.15v11.7c0 .8.81 1.3 1.5.9l10.25-5.85c.67-.4.67-1.4 0-1.8L8.45 5.25z" />
                </svg>
              )}
              <span>
                {isLoading && currentTrack.id === mainStation.id
                  ? (language === 'en' ? 'Connecting...' : 'Bağlanıyor...')
                  : isPlaying && currentTrack.id === mainStation.id
                  ? t('heroPause')
                  : t('heroListenLive')}
              </span>
            </button>
            <a
              href="https://radiotedu.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-800 dark:text-gray-200 text-sm font-medium transition-all border border-zinc-300 dark:border-gray-700/50 shadow-sm"
            >
              <span>radiotedu.com</span>
              <span className="text-xs">↗</span>
            </a>
          </div>
        </div>

        {/* Dekoratif Radyo Frekans Dalgaları */}
        <div className="absolute right-4 bottom-4 opacity-15 pointer-events-none hidden sm:flex items-end gap-1.5 h-24">
          {[40, 75, 50, 90, 60, 100, 70, 45, 85, 55, 95, 65, 40, 80].map((h, i) => (
            <div
              key={i}
              className="w-1.5 bg-red-500 rounded-full animate-pulse"
              style={{ height: `${h}%`, animationDelay: `${(i * 0.15).toFixed(2)}s` }}
            />
          ))}
        </div>
      </section>

      {/* Keşfet Sekmeleri (Tabs) */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-gray-800 pb-3 shrink-0 overflow-x-auto">
        {[
          { id: 'all', label: t('tabAll') },
          { id: 'radios', label: t('tabRadios') },
          { id: 'podcasts', label: t('tabPodcasts') },
          { id: 'episodes', label: t('tabEpisodes') }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-gray-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* BÖLÜM 1: RADYOLAR */}
      {(activeTab === 'all' || activeTab === 'radios') && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold tracking-wider text-red-600 dark:text-red-500 uppercase">{t('stationsHeaderSmall')}</p>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{t('stationsHeaderBig')}</h2>
            </div>
            <span className="text-xs text-zinc-500 dark:text-gray-500">{t('stationsCount')}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subStations.map(station => {
              const isStationActive = currentTrack.id === station.id;
              const isStationLoading = isLoading && isStationActive;
              const isStationPlaying = isPlaying && isStationActive;
              return (
                <article
                  key={station.id}
                  className={`bg-white dark:bg-radio-card rounded-2xl p-4 border transition-all duration-200 flex flex-col justify-between group hover:border-zinc-300 dark:hover:border-gray-700 shadow-sm ${
                    isStationPlaying ? 'border-red-600 shadow-lg shadow-red-600/10' : 'border-zinc-200 dark:border-gray-800/80'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <img
                      src={station.artwork}
                      alt={station.title}
                      className="w-14 h-14 rounded-xl object-cover bg-black shrink-0 border border-zinc-200 dark:border-gray-800 group-hover:scale-105 transition-transform"
                    />
                    <div className="min-w-0">
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-gray-400 bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded-md mb-1">
                        {station.badge}
                      </span>
                      <h3 className="font-bold text-zinc-900 dark:text-white text-sm truncate">{station.title}</h3>
                      <p className="text-xs text-red-600 dark:text-red-400">{station.subtitle}</p>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-gray-400 leading-relaxed mb-4 line-clamp-2">
                    {station.description}
                  </p>

                  <button
                    onClick={() => playTrack(station)}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isStationPlaying
                        ? 'bg-red-600 text-white shadow-sm'
                        : isStationLoading
                        ? 'bg-red-600/80 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-gray-200 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-gray-700/50'
                    }`}
                  >
                    {isStationLoading ? (
                      <svg className="w-3.5 h-3.5 animate-spin text-current" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : isStationPlaying ? (
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <rect x="6.25" y="5" width="3.5" height="14" rx="1.75" />
                        <rect x="14.25" y="5" width="3.5" height="14" rx="1.75" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M8.45 5.25C7.76 4.85 6.95 5.35 6.95 6.15v11.7c0 .8.81 1.3 1.5.9l10.25-5.85c.67-.4.67-1.4 0-1.8L8.45 5.25z" />
                      </svg>
                    )}
                    <span>
                      {isStationLoading
                        ? (language === 'en' ? 'Connecting...' : 'Bağlanıyor...')
                        : isStationPlaying
                        ? t('playingPause')
                        : t('listen')}
                    </span>
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* BÖLÜM 2: PODCASTLER */}
      {(activeTab === 'all' || activeTab === 'podcasts') && (
        <section className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold tracking-wider text-red-600 dark:text-red-500 uppercase">{t('podcastsHeaderSmall')}</p>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{t('podcastsHeaderBig')}</h2>
            </div>
            <a
              href="https://radiotedu.com/podcastler/"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
            >
              {t('podcastsAllLink')}
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
            {PODCASTS.map(podcast => (
              <a
                key={podcast.id}
                href={podcast.link}
                target="_blank"
                rel="noreferrer"
                className="group bg-white dark:bg-radio-card rounded-2xl overflow-hidden border border-zinc-200 dark:border-gray-800/80 hover:border-zinc-300 dark:hover:border-gray-700 transition-all flex flex-col shadow-sm"
              >
                <div className="relative aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                  <img
                    src={podcast.artwork}
                    alt={podcast.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <span className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
                    {podcast.episodesCount}
                  </span>
                </div>
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-red-600 dark:text-red-400 font-semibold block mb-0.5">
                      {podcast.category}
                    </span>
                    <h3 className="font-bold text-zinc-900 dark:text-white text-xs line-clamp-1 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                      {podcast.title}
                    </h3>
                  </div>
                  <span className="text-[11px] text-zinc-500 dark:text-gray-500 mt-2 flex items-center gap-1">
                    {t('podcastExploreLink')}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* BÖLÜM 3: SON BÖLÜMLER (OYNATILABİLİR) */}
      {(activeTab === 'all' || activeTab === 'episodes') && (
        <section className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold tracking-wider text-red-600 dark:text-red-500 uppercase">{t('episodesHeaderSmall')}</p>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{t('episodesHeaderBig')}</h2>
            </div>
            <span className="text-xs text-zinc-500 dark:text-gray-500">{t('episodesSubtitle')}</span>
          </div>

          <div className="space-y-3">
            {LATEST_EPISODES.map(episode => {
              const isEpisodePlaying = isPlaying && currentTrack.id === episode.id;
              return (
                <div
                  key={episode.id}
                  className={`bg-white dark:bg-radio-card rounded-2xl p-4 border transition-all flex items-center justify-between gap-4 group hover:border-zinc-300 dark:hover:border-gray-700 shadow-sm ${
                    isEpisodePlaying ? 'border-red-600 shadow-md shadow-red-600/10' : 'border-zinc-200 dark:border-gray-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={episode.artwork}
                      alt={episode.title}
                      className="w-12 h-12 rounded-xl object-cover shrink-0 border border-zinc-200 dark:border-gray-800"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-[10px] text-zinc-500 dark:text-gray-400 mb-0.5">
                        <span className="text-red-600 dark:text-red-400 font-semibold">{episode.show}</span>
                        <span>•</span>
                        <span>{episode.date}</span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white truncate group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                        {episode.title}
                      </h4>
                      <p className="text-[11px] text-zinc-500 dark:text-gray-500 truncate mt-0.5">{episode.description}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => playTrack(episode)}
                    className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                      isEpisodePlaying
                        ? 'bg-red-600 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-gray-200 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-gray-700/50'
                    }`}
                  >
                    {isEpisodePlaying ? (
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <rect x="6.25" y="5" width="3.5" height="14" rx="1.75" />
                        <rect x="14.25" y="5" width="3.5" height="14" rx="1.75" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M8.45 5.25C7.76 4.85 6.95 5.35 6.95 6.15v11.7c0 .8.81 1.3 1.5.9l10.25-5.85c.67-.4.67-1.4 0-1.8L8.45 5.25z" />
                      </svg>
                    )}
                    <span className="hidden sm:inline">{isEpisodePlaying ? t('episodePause') : t('episodePlay')}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}

import React, { useContext, useState } from 'react';
import { AudioContext } from '../context/AudioContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { STATIONS, PODCASTS, LATEST_EPISODES } from '../data/radioData';
import Header from './Header';

export default function ExploreSection() {
  const { isPlaying, isLoading, currentTrack, playTrack, nowPlaying } = useContext(AudioContext);
  const { isDark, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'radios', 'podcasts', 'episodes'

  const mainStation = STATIONS[0];
  const subStations = STATIONS.slice(1);

  return (
    <div className="w-full md:w-2/3 h-full flex flex-col border-r border-stone-200 dark:border-stone-800/80 bg-[#fdfbf7] dark:bg-[#120e0c] text-stone-900 dark:text-stone-100 transition-colors duration-300 overflow-hidden">
      {/* Sabit Header (Yalnızca Sol Sütun Üstünde) */}
      <Header />

      {/* Kaydırılabilir Keşfet İçeriği */}
      <main className="flex-1 overflow-y-auto p-6 pb-6 space-y-8 custom-scrollbar">
      {/* Hero Banner / Vintage Analog Radyo Konsolu */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-100 via-stone-200/60 to-[#eeeae0] dark:from-[#18181b] dark:via-[#131316] dark:to-black border border-stone-300 dark:border-stone-800/80 p-6 sm:p-8 lg:p-9 shadow-xl dark:shadow-2xl shrink-0 transition-all duration-300 group">
        {/* Subtle Izgara & Glow Efekti */}
        <div className="absolute inset-0 bg-[radial-gradient(#dc2626_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.07] pointer-events-none" />
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-red-600/10 dark:bg-red-600/15 rounded-full blur-3xl pointer-events-none transition-all duration-700 group-hover:bg-red-600/20" />

        {/* Üst Bilgi Çubuğu: Stüdyo Durumu, Frekans & Kalite */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 pb-4 mb-6 border-b border-stone-300/80 dark:border-stone-800/80">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
            </span>
            <span className="text-[11px] font-black uppercase tracking-widest text-red-600 dark:text-red-500 font-mono">
              {t('heroVintageTube')}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono text-stone-600 dark:text-stone-400">
            <span className="px-2.5 py-0.5 rounded-full bg-stone-200/80 dark:bg-stone-800/80 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-300">
              {t('heroFrequency')}
            </span>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 font-semibold">
              {t('heroQuality')}
            </span>
          </div>
        </div>

        {/* NOSTALJİK ANALOG FM FREKANS KADRANI (TUNING DIAL) */}
        <div className="relative z-10 mb-6 bg-stone-200/90 dark:bg-[#0c0c0e] border border-stone-300 dark:border-stone-800 rounded-2xl p-3 shadow-inner overflow-hidden">
          <div className="flex items-center justify-between text-[10px] font-mono text-stone-700 dark:text-stone-400 px-2 mb-1.5 font-bold tracking-widest select-none">
            <span>88.0 MHz</span>
            <span>92.0</span>
            <span>96.0</span>
            <span>100.0</span>
            <span>104.0</span>
            <span>108.0 MHz</span>
          </div>

          {/* Frekans Çizgileri ve Hareketli Kırmızı İbre */}
          <div className="relative h-6 bg-stone-100 dark:bg-stone-900 rounded-lg border border-stone-300/80 dark:border-stone-800/80 flex items-center px-2 overflow-hidden">
            {/* Arka plan ızgara çizgileri */}
            <div className="absolute inset-0 flex justify-between px-3 items-center opacity-40 pointer-events-none">
              {[...Array(25)].map((_, i) => (
                <span key={i} className={`w-[1px] ${i % 5 === 0 ? 'h-4 bg-stone-600 dark:bg-stone-400' : 'h-2 bg-stone-400 dark:bg-stone-600'}`} />
              ))}
            </div>

            {/* Hareketli Kırmızı Analog İbre */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-red-600 shadow-[0_0_8px_#dc2626] transition-all duration-700 z-10 flex flex-col items-center justify-between"
              style={{
                left: `${
                  STATIONS.findIndex(s => s.id === currentTrack.id) >= 0
                    ? Math.min(92, Math.max(8, 10 + STATIONS.findIndex(s => s.id === currentTrack.id) * 16))
                    : 10
                }%`
              }}
            >
              <div className="w-2 h-2 rounded-full bg-red-600 -mt-1 shadow-md" />
              <div className="w-2 h-2 rounded-full bg-red-600 -mb-1 shadow-md" />
            </div>
          </div>
        </div>

        {/* Ana İçerik Grid (Sol: Metin & Butonlar, Sağ: Radyo Kartı & Analog VU Meter) */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Sol Kolon (7 Birim) */}
          <div className="lg:col-span-7 space-y-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider mb-3">
                <span>{t('heroSubtitle')}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 dark:text-white tracking-tight leading-none">
                {t('heroTitle1')}{' '}
                <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-rose-500 to-red-700 font-serif italic drop-shadow-sm">
                  {t('heroTitle2')}
                </span>
              </h1>
            </div>

            <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed max-w-xl font-sans">
              {t('heroDesc')}
            </p>

            {/* Butonlar */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <button
                onClick={() => playTrack(mainStation)}
                className={`flex-1 sm:flex-initial px-6 py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-md ${
                  isPlaying && currentTrack.id === mainStation.id
                    ? 'bg-stone-800 dark:bg-stone-900 hover:bg-stone-700 text-white border border-stone-700'
                    : 'bg-red-700 dark:bg-red-600 hover:bg-red-800 dark:hover:bg-red-500 text-white shadow-md'
                }`}
              >
                {isLoading && currentTrack.id === mainStation.id ? (
                  <svg className="w-5 h-5 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : isPlaying && currentTrack.id === mainStation.id ? (
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <rect x="6" y="5" width="4" height="14" rx="2" />
                    <rect x="14" y="5" width="4" height="14" rx="2" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
                <span className="tracking-wide">
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
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-sm font-semibold transition-all border border-stone-300 dark:border-stone-700 shadow-sm"
              >
                <span>radiotedu.com</span>
                <span className="text-xs text-stone-400">↗</span>
              </a>
            </div>

            {/* Frekans Butonları */}
            <div className="pt-3 border-t border-stone-300/80 dark:border-stone-800/80">
              <span className="text-[11px] font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider block mb-2 font-mono">
                {t('heroQuickStations')}
              </span>
              <div className="flex flex-wrap gap-2">
                {STATIONS.map((st, idx) => {
                  const isStActive = currentTrack.id === st.id;
                  const isStPlaying = isPlaying && isStActive;
                  const mhz = (88.0 + idx * 4.0).toFixed(1);
                  return (
                    <button
                      key={st.id}
                      onClick={() => playTrack(st)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
                        isStActive
                          ? 'bg-red-700 dark:bg-red-600 text-white shadow-md'
                          : 'bg-stone-200/90 hover:bg-stone-300/90 dark:bg-stone-800/90 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-300/80 dark:border-stone-700/60'
                      }`}
                    >
                      {isStPlaying ? (
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-stone-400 dark:bg-stone-500" />
                      )}
                      <span>{st.title}</span>
                      <span className="text-[10px] opacity-70">({mhz} MHz)</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sağ Kolon (5 Birim): Retro Radyo Kabini & İbreli Analog VU Meter */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="w-full max-w-sm bg-white dark:bg-[#18181c] p-5 rounded-3xl border border-stone-300 dark:border-stone-800 shadow-xl dark:shadow-2xl relative overflow-hidden group/card">
              {/* Çalma esnasında kırmızı parlama */}
              {isPlaying && (
                <div className="absolute inset-0 bg-red-600/5 animate-pulse pointer-events-none rounded-3xl" />
              )}

              {/* Albüm Görseli / Vinyl Efekti */}
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden mb-4 bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 flex items-center justify-center shadow-lg">
                <img
                  src={nowPlaying?.artwork || currentTrack?.artwork || mainStation.artwork}
                  alt={nowPlaying?.song || currentTrack?.title || mainStation.title}
                  className={`w-full h-full object-cover transition-transform duration-700 ${
                    isPlaying ? 'scale-105 filter brightness-105' : 'opacity-90'
                  }`}
                />
                
                {/* Alt Kısım: Şarkı / Sanatçı Bilgisi */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent flex items-end justify-between p-4">
                  <div className="min-w-0 pr-2">
                    <h3 className="text-white font-serif font-bold text-base sm:text-lg leading-tight truncate drop-shadow-md" title={nowPlaying?.song || currentTrack?.title || mainStation.title}>
                      {nowPlaying?.song || currentTrack?.title || mainStation.title}
                    </h3>

                    <p className="text-xs text-stone-200 font-medium truncate mt-1" title={nowPlaying?.artist || currentTrack?.artist || currentTrack?.subtitle || mainStation.subtitle}>
                      {nowPlaying?.artist
                        ? `🎤 ${nowPlaying.artist}`
                        : currentTrack?.artist || currentTrack?.subtitle || mainStation.subtitle}
                    </p>
                  </div>
                </div>
              </div>

              {/* NOSTALJİK İBRELİ ANALOG VU METER (RETRO DESİBEL ÖLÇER) */}
              <div className="bg-stone-100 dark:bg-[#0c0c0e] border border-stone-300 dark:border-stone-800 rounded-xl p-3 shadow-inner">
                <div className="flex items-center justify-between text-[9px] font-mono text-stone-600 dark:text-stone-400 mb-1 px-1 font-bold">
                  <span>-20</span>
                  <span>-10</span>
                  <span>-5</span>
                  <span>-3</span>
                  <span>0</span>
                  <span className="text-red-600">+3 dB</span>
                </div>
                
                {/* VU Meter İbresi */}
                <div className="relative h-7 bg-stone-200/90 dark:bg-stone-900 rounded border border-stone-300 dark:border-stone-800 flex items-center justify-center overflow-hidden">
                  <div
                    className="w-0.5 h-6 bg-red-600 shadow-[0_0_8px_#dc2626] origin-bottom transition-transform duration-300"
                    style={{
                      transform: isPlaying ? `rotate(15deg)` : 'rotate(-40deg)'
                    }}
                  />
                </div>
                <div className="text-[9px] text-stone-500 dark:text-stone-400 font-mono text-center mt-1 uppercase tracking-widest font-bold">
                  VU METER · ANALOG AUDIO
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Keşfet Sekmeleri (Tabs) */}
      <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-3 shrink-0 overflow-x-auto">
        {[
          { id: 'all', label: t('tabAll') },
          { id: 'radios', label: t('tabRadios') },
          { id: 'podcasts', label: t('tabPodcasts') },
          { id: 'episodes', label: t('tabEpisodes') }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold font-mono whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-red-700 dark:bg-red-600 text-white shadow-md'
                : 'bg-stone-200/70 dark:bg-[#1f1a17] text-stone-700 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-800'
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
              <p className="text-[11px] font-bold tracking-wider text-red-700 dark:text-red-500 uppercase font-mono">{t('stationsHeaderSmall')}</p>
              <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 font-serif">{t('stationsHeaderBig')}</h2>
            </div>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-mono">{t('stationsCount')}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subStations.map(station => {
              const isStationActive = currentTrack.id === station.id;
              const isStationLoading = isLoading && isStationActive;
              const isStationPlaying = isPlaying && isStationActive;
              return (
                <article
                  key={station.id}
                  className={`bg-stone-50 dark:bg-[#1a1614] rounded-2xl p-4 border transition-all duration-200 flex flex-col justify-between group hover:border-red-600/50 shadow-sm ${
                    isStationPlaying ? 'border-red-600 shadow-lg shadow-red-600/20' : 'border-stone-200 dark:border-stone-800/80'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <img
                      src={station.artwork}
                      alt={station.title}
                      className="w-14 h-14 rounded-xl object-cover bg-black shrink-0 border border-stone-200 dark:border-stone-800 group-hover:scale-105 transition-transform"
                    />
                    <div className="min-w-0">
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-950/60 px-2 py-0.5 rounded-md mb-1 font-mono">
                        {station.badge}
                      </span>
                      <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm truncate font-serif">{station.title}</h3>
                      <p className="text-xs text-stone-600 dark:text-stone-400">{station.subtitle}</p>
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed mb-4 line-clamp-2">
                    {station.description}
                  </p>

                  <button
                    onClick={() => playTrack(station)}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-semibold font-mono flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isStationPlaying
                        ? 'bg-red-700 text-white shadow-sm'
                        : isStationLoading
                        ? 'bg-red-700/80 text-white'
                        : 'bg-stone-200/80 dark:bg-stone-800/80 hover:bg-red-700 hover:text-white dark:hover:bg-red-600 text-stone-800 dark:text-stone-200 border border-stone-300/50 dark:border-stone-700/50'
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
              <p className="text-[11px] font-bold tracking-wider text-red-700 dark:text-red-500 uppercase font-mono">{t('podcastsHeaderSmall')}</p>
              <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 font-serif">{t('podcastsHeaderBig')}</h2>
            </div>
            <a
              href="https://radiotedu.com/podcastler/"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-red-700 dark:text-red-400 hover:underline flex items-center gap-1 font-mono"
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
                className="group bg-stone-50 dark:bg-[#1a1614] rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 hover:border-red-600/50 transition-all flex flex-col shadow-sm"
              >
                <div className="relative aspect-square overflow-hidden bg-[#120e0c]">
                  <img
                    src={podcast.artwork}
                    alt={podcast.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <span className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-md text-stone-200 font-mono text-[10px] font-semibold px-2 py-0.5 rounded-md border border-stone-700">
                    {podcast.episodesCount}
                  </span>
                </div>
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-red-700 dark:text-red-400 font-semibold block mb-0.5 font-mono">
                      {podcast.category}
                    </span>
                    <h3 className="font-bold text-stone-900 dark:text-stone-100 text-xs line-clamp-1 group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors font-serif">
                      {podcast.title}
                    </h3>
                  </div>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400 mt-2 flex items-center gap-1 font-mono">
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
              <p className="text-[11px] font-bold tracking-wider text-red-700 dark:text-red-500 uppercase font-mono">{t('episodesHeaderSmall')}</p>
              <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 font-serif">{t('episodesHeaderBig')}</h2>
            </div>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-mono">{t('episodesSubtitle')}</span>
          </div>

          <div className="space-y-3">
            {LATEST_EPISODES.map(episode => {
              const isEpisodePlaying = isPlaying && currentTrack.id === episode.id;
              return (
                <div
                  key={episode.id}
                  className={`bg-stone-50 dark:bg-[#1a1614] rounded-2xl p-4 border transition-all flex items-center justify-between gap-4 group hover:border-red-600/50 shadow-sm ${
                    isEpisodePlaying ? 'border-red-600 shadow-md shadow-red-600/20' : 'border-stone-200 dark:border-stone-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={episode.artwork}
                      alt={episode.title}
                      className="w-12 h-12 rounded-xl object-cover shrink-0 border border-stone-200 dark:border-stone-800"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-[10px] text-stone-500 dark:text-stone-400 mb-0.5 font-mono">
                        <span className="text-red-700 dark:text-red-400 font-semibold">{episode.show}</span>
                        <span>•</span>
                        <span>{episode.date}</span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-semibold text-stone-900 dark:text-stone-100 truncate group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors font-serif">
                        {episode.title}
                      </h4>
                      <p className="text-[11px] text-stone-600 dark:text-stone-300 truncate mt-0.5">{episode.description}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => playTrack(episode)}
                    className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold font-mono flex items-center gap-2 transition-all cursor-pointer ${
                      isEpisodePlaying
                        ? 'bg-red-700 text-white'
                        : 'bg-stone-200/80 dark:bg-stone-800/80 hover:bg-red-700 hover:text-white dark:hover:bg-red-600 text-stone-800 dark:text-stone-200 border border-stone-300/50 dark:border-stone-700/50'
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
  </div>
);
}

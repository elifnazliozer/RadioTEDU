import React, { useState, useEffect } from 'react';
import { WEEKDAY_SCHEDULE, WEEKEND_SCHEDULE } from '../data/scheduleData';
import { useLanguage } from '../context/LanguageContext';

export default function ScheduleWidget() {
  const { t } = useLanguage();
  const [selectedTab, setSelectedTab] = useState('today'); // 'today', 'weekday', 'weekend'
  const [expandedId, setExpandedId] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Canlı saat güncellemesi
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const currentHour = currentTime.getHours();
  const currentMinutes = currentTime.getMinutes();
  const dayOfWeek = currentTime.getDay(); // 0 = Pazar, 6 = Cumartesi
  const isWeekendNow = dayOfWeek === 0 || dayOfWeek === 6;

  // Hangi liste gösterilecek?
  let activeList = WEEKDAY_SCHEDULE;
  if (selectedTab === 'weekend' || (selectedTab === 'today' && isWeekendNow)) {
    activeList = WEEKEND_SCHEDULE;
  }

  // Şu anki programa göre eşleştirme yap
  const currentProgram = activeList.find((prog) => {
    // 22:00 - 02:00 gibi gece yarısını aşan saatler için kontrol
    if (prog.endHour > 24) {
      if (currentHour >= prog.startHour || currentHour < prog.endHour - 24) {
        return true;
      }
    } else if (currentHour >= prog.startHour && currentHour < prog.endHour) {
      return true;
    }
    return false;
  }) || activeList[0];

  // Programın yüzde kaçının tamamlandığını hesapla
  let progressPercent = 50;
  if (currentProgram) {
    const startMins = currentProgram.startHour * 60;
    let endMins = currentProgram.endHour * 60;
    let nowMins = currentHour * 60 + currentMinutes;
    if (currentProgram.endHour > 24 && currentHour < 12) {
      nowMins += 24 * 60;
    }
    const totalDuration = endMins - startMins;
    const elapsed = Math.max(0, nowMins - startMins);
    progressPercent = Math.min(100, Math.max(5, Math.round((elapsed / totalDuration) * 100)));
  }

  return (
    <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-gray-800/90 flex flex-col bg-white dark:bg-[#0c0c0f] text-zinc-900 dark:text-white shrink-0 transition-colors duration-300">
      {/* Başlık ve Gün Seçici */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-600 dark:text-red-500 shadow-[0_0_10px_rgba(229,9,20,0.2)] shrink-0">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
              <line x1="16" x2="16" y1="2" y2="6"/>
              <line x1="8" x2="8" y1="2" y2="6"/>
              <line x1="3" x2="21" y1="10" y2="10"/>
              <path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/>
            </svg>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
              {t('scheduleTitle')}
            </h3>
            <span className="text-[10px] text-zinc-500 font-mono">
              Europe/Ankara · 24/7
            </span>
          </div>
        </div>

        {/* Sekmeler */}
        <div className="flex items-center bg-zinc-100 dark:bg-zinc-900/90 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-[10px] font-semibold">
          <button
            onClick={() => setSelectedTab('today')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              selectedTab === 'today'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            {t('today')}
          </button>
          <button
            onClick={() => setSelectedTab('weekday')}
            className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
              selectedTab === 'weekday'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            {t('weekdays')}
          </button>
          <button
            onClick={() => setSelectedTab('weekend')}
            className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
              selectedTab === 'weekend'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            {t('weekends')}
          </button>
        </div>
      </div>

      {/* Şu An Yayında Olan Program Vitrini (Featured Card) */}
      {currentProgram && (
        <div className="bg-gradient-to-br from-red-50 via-zinc-50 to-white dark:from-red-950/40 dark:via-zinc-900/90 dark:to-zinc-950 p-3 rounded-xl border border-red-200/80 dark:border-red-900/40 mb-3 shadow-md dark:shadow-lg shrink-0 transition-colors duration-300">
          <div className="flex items-center justify-between mb-1">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 dark:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
              {t('activeShow')}
            </span>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono font-medium">
              {currentProgram.timeStr}
            </span>
          </div>

          <h4 className="font-bold text-zinc-900 dark:text-white text-sm tracking-tight flex items-center justify-between">
            <span>{currentProgram.title}</span>
            <span className="text-[10px] text-red-600 dark:text-red-400 font-normal bg-red-100/80 dark:bg-red-950/60 px-2 py-0.5 rounded-md border border-red-200 dark:border-red-900/30">
              {currentProgram.genre}
            </span>
          </h4>

          <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1 leading-snug line-clamp-1">
            {currentProgram.desc}
          </p>

          {/* Canlı İlerleme Çubuğu */}
          <div className="mt-2.5">
            <div className="flex items-center justify-between text-[9px] text-zinc-500 mb-1">
              <span>{t('broadcastProgress')}</span>
              <span>%{progressPercent}</span>
            </div>
            <div className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-rose-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Günün Tüm Akışı (Kaydırılabilir Liste) */}
      <div className="space-y-1.5 pr-1 max-h-48 overflow-y-auto custom-scrollbar">
        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 flex items-center justify-between sticky top-0 bg-white dark:bg-[#0c0c0f] py-0.5 z-10 transition-colors">
          <span>{t('dailyPrograms')}</span>
          <span className="text-[9px] lowercase font-normal text-zinc-500 dark:text-zinc-600">{t('clickForDetails')}</span>
        </div>

        {activeList.map((item) => {
          const isCurrent = currentProgram && currentProgram.id === item.id;
          const isExpanded = expandedId === item.id;

          return (
            <div
              key={item.id}
              onClick={() => setExpandedId(isExpanded ? null : item.id)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                isCurrent
                  ? 'bg-red-50/80 dark:bg-zinc-900/90 border-red-400/80 dark:border-red-600/60 shadow-sm'
                  : 'bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800/70 hover:bg-zinc-100 dark:hover:bg-zinc-850 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`font-mono text-[10px] shrink-0 font-semibold ${
                      isCurrent ? 'text-red-600 dark:text-red-400' : 'text-zinc-500 dark:text-zinc-400'
                    }`}
                  >
                    {item.timeStr.split('–')[0].trim()}
                  </span>
                  <span
                    className={`text-xs font-semibold truncate ${
                      isCurrent ? 'text-zinc-900 dark:text-white' : 'text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    {item.title}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[9px] text-zinc-600 dark:text-zinc-400 bg-zinc-200/80 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                    {item.genre.split('&')[0].trim()}
                  </span>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                    {isExpanded ? '▴' : '▾'}
                  </span>
                </div>
              </div>

              {/* Tıklandığında açılan detay */}
              {isExpanded && (
                <div className="mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-800/80 text-[11px] text-zinc-600 dark:text-zinc-400 space-y-1 animate-fadeIn">
                  <p className="leading-relaxed">{item.desc}</p>
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1">
                    <span>{t('hostTeam')}: <strong className="text-zinc-800 dark:text-zinc-300">{item.host}</strong></span>
                    <span className="text-red-600 dark:text-red-400">{item.genre}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

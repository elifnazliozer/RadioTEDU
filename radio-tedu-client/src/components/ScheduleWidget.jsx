import React, { useState, useEffect } from 'react';
import { WEEKDAY_SCHEDULE, WEEKEND_SCHEDULE } from '../data/scheduleData';
import { useLanguage } from '../context/LanguageContext';

// canlı yayın akışı bileşeni: anlık saat dilimine göre canlı yayındaki programı ve günlük akışı sunar
export default function ScheduleWidget() {
  const { t } = useLanguage();
  const [selectedTab, setSelectedTab] = useState('today'); // 'today', 'weekday', 'weekend'
  const [expandedId, setExpandedId] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // canlı saat güncellemesi
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const currentHour = currentTime.getHours();
  const currentMinutes = currentTime.getMinutes();
  const dayOfWeek = currentTime.getDay(); // 0 = pazar, 6 = cumartesi
  const isWeekendNow = dayOfWeek === 0 || dayOfWeek === 6;

  // hangi liste gösterilecek
  let activeList = WEEKDAY_SCHEDULE;
  if (selectedTab === 'weekend' || (selectedTab === 'today' && isWeekendNow)) {
    activeList = WEEKEND_SCHEDULE;
  }

  // şu anki programa göre eşleştirme yap
  const currentProgram = activeList.find((prog) => {
    // gece yarısını aşan saatler için kontrol
    if (prog.endHour > 24) {
      if (currentHour >= prog.startHour || currentHour < prog.endHour - 24) {
        return true;
      }
    } else if (currentHour >= prog.startHour && currentHour < prog.endHour) {
      return true;
    }
    return false;
  }) || activeList[0];

  // programın yüzde kaçının tamamlandığını hesapla
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
    <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex flex-col bg-[#fdfbf7] dark:bg-[#120e0c] text-stone-900 dark:text-stone-100 shrink-0 transition-colors duration-300">
      {/* başlık ve gün seçici */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-700 dark:text-red-400 shadow-sm shrink-0">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
              <line x1="16" x2="16" y1="2" y2="6"/>
              <line x1="8" x2="8" y1="2" y2="6"/>
              <line x1="3" x2="21" y1="10" y2="10"/>
              <path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/>
            </svg>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100 font-mono">
              {t('scheduleTitle')}
            </h3>
            <span className="text-[10px] text-red-700 dark:text-red-400 font-mono">
              Europe/Ankara · 24/7 ANALOG
            </span>
          </div>
        </div>

        {/* sekmeler */}
        <div className="flex items-center bg-stone-200/80 dark:bg-[#1a1614] p-0.5 rounded-lg border border-stone-300 dark:border-stone-800 text-[10px] font-semibold font-mono">
          <button
            onClick={() => setSelectedTab('today')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              selectedTab === 'today'
                ? 'bg-red-700 dark:bg-red-600 text-white shadow-sm'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            {t('today')}
          </button>
          <button
            onClick={() => setSelectedTab('weekday')}
            className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
              selectedTab === 'weekday'
                ? 'bg-red-700 dark:bg-red-600 text-white shadow-sm'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            {t('weekdays')}
          </button>
          <button
            onClick={() => setSelectedTab('weekend')}
            className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
              selectedTab === 'weekend'
                ? 'bg-red-700 dark:bg-red-600 text-white shadow-sm'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            {t('weekends')}
          </button>
        </div>
      </div>

      {/* şu an yayında olan program vitrini */}
      {currentProgram && (
        <div className="bg-stone-100/90 dark:bg-[#1c1815] p-3 rounded-xl border border-stone-300 dark:border-stone-800 mb-3 shadow-md dark:shadow-lg shrink-0 transition-colors duration-300">
          <div className="flex items-center justify-between mb-1">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-800 dark:text-red-300 border border-red-600/30 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
              {t('activeShow')}
            </span>
            <span className="text-[10px] text-stone-600 dark:text-stone-400 font-mono font-medium">
              {currentProgram.timeStr}
            </span>
          </div>

          <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm tracking-tight flex items-center justify-between font-serif">
            <span>{currentProgram.title}</span>
            <span className="text-[10px] text-red-700 dark:text-red-400 font-normal font-mono bg-red-100 dark:bg-red-950/60 px-2 py-0.5 rounded-md border border-stone-300 dark:border-stone-800">
              {currentProgram.genre}
            </span>
          </h4>

          <p className="text-[11px] text-stone-700 dark:text-stone-300 mt-1 leading-snug line-clamp-1">
            {currentProgram.desc}
          </p>

          {/* canlı ilerleme çubuğu */}
          <div className="mt-2.5">
            <div className="flex items-center justify-between text-[9px] text-stone-500 dark:text-stone-400 mb-1 font-mono">
              <span>{t('broadcastProgress')}</span>
              <span>%{progressPercent}</span>
            </div>
            <div className="w-full h-1.5 bg-stone-200 dark:bg-stone-900 rounded-full overflow-hidden border border-stone-300 dark:border-stone-800">
              <div
                className="h-full bg-gradient-to-r from-red-700 to-red-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* günün tüm akışı */}
      <div className="space-y-1.5 pr-1 max-h-48 overflow-y-auto custom-scrollbar">
        <div className="text-[10px] font-bold text-red-700 dark:text-red-400 uppercase tracking-wider mb-1 flex items-center justify-between sticky top-0 bg-[#fdfbf7] dark:bg-[#120e0c] py-0.5 z-10 font-mono transition-colors">
          <span>{t('dailyPrograms')}</span>
          <span className="text-[9px] lowercase font-normal text-stone-500 dark:text-stone-400">{t('clickForDetails')}</span>
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
                  ? 'bg-red-50 dark:bg-red-950/30 border-red-500/60 shadow-sm'
                  : 'bg-stone-100/60 dark:bg-[#181513]/60 border-stone-200 dark:border-stone-800 hover:bg-stone-200/60 dark:hover:bg-[#201c19]'
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

              {/* tıklandığında açılan detay */}
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

import React, { useContext } from 'react';
import { AudioContext } from './context/AudioContext';

function App() {
  const { isPlaying, togglePlay, currentTrack } = useContext(AudioContext);

  return (
    <div className="h-screen flex flex-col bg-radio-dark text-white overflow-hidden">
      
      {/* üst ana içerik */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden pb-20">
        
        {/* sol sütun, canlı yayın ve logo */}
        <main className="w-full md:w-2/3 p-6 overflow-y-auto border-r border-gray-800 flex flex-col">
          <header className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="RadioTEDU" className="h-10 object-contain" />
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-500 border border-red-500/20">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                CANLI YAYIN
              </span>
            </div>
          </header>
          
          <div className="bg-radio-card p-8 rounded-2xl shadow-xl mb-6 flex-1 border border-gray-800/50">
            <h2 className="text-2xl font-bold text-white mb-2">{currentTrack.title}</h2>
            <p className="text-radio-accent font-medium mb-4">{currentTrack.artist}</p>
            <p className="text-gray-400 leading-relaxed text-sm">
              RadioTEDU akıllı dinleyici paneline hoş geldiniz.
            </p>
          </div>
        </main>

        {/* sağ sütun, takvim ve ai direktörü */}
        <aside className="w-full md:w-1/3 flex flex-col overflow-hidden bg-[#0d0d0f]">
          <div className="h-1/2 p-6 overflow-y-auto border-b border-gray-800">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span>📅</span> Program Takvimi
            </h3>
            <div className="bg-radio-card p-4 rounded-xl text-sm text-gray-400 border border-gray-800">
              <p className="font-medium text-gray-300">14:00 - Kampüs Gündemi</p>
              <p className="text-xs text-gray-500 mt-1">Şu an yayında</p>
            </div>
          </div>
          
          <div className="h-1/2 p-6 flex flex-col bg-gradient-to-b from-transparent to-[#141214]">
            <h3 className="text-lg font-bold mb-2 text-radio-accent flex items-center gap-2">
              <span>✨</span> AI Müzik Direktörü
            </h3>
            <p className="text-xs text-gray-400 mb-4">Şu an ne yapıyorsun? Ruh haline göre içerik önerelim.</p>
            
            <div className="mt-auto bg-radio-card p-4 rounded-xl border border-gray-800">
              <input 
                type="text" 
                placeholder="Örn: Kütüphanede ders çalışıyorum"
                className="w-full bg-transparent border-b border-gray-700 focus:outline-none focus:border-radio-accent pb-2 text-sm text-white placeholder-gray-500"
              />
            </div>
          </div>
        </aside>
      </div>

      {/* alt sabit player */}
      <div className="h-20 bg-black fixed bottom-0 w-full flex items-center justify-between px-6 border-t border-gray-800 z-50 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 bg-radio-accent/10 border border-radio-accent/30 rounded-xl flex items-center justify-center transition-all ${isPlaying ? 'scale-105 shadow-lg shadow-red-500/20' : ''}`}>
            <span className="text-xl">📻</span>
          </div>
          <div>
            <p className="font-bold text-sm text-white">{currentTrack.title}</p>
            <p className="text-xs text-gray-400">RadioTEDU Canlı Yayın</p>
          </div>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-radio-accent text-white flex items-center justify-center text-xl hover:scale-105 active:scale-95 transition-all shadow-md shadow-red-600/30 cursor-pointer"
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
        </div>
      </div>

    </div>
  );
}

export default App;
import React from 'react';
import PhotoBooth from './components/PhotoBooth';
import { Camera as CameraIcon, Heart } from 'lucide-react';

/**
 * Komponen Utama App
 * Menampilkan antarmuka dasar dan merender komponen PhotoBooth terintegrasi.
 */
function App() {
  return (
    <div className="min-h-screen bg-chic-gradient bg-grid-chic text-chic-dark flex flex-col justify-between relative px-4 py-6 md:px-8">
      
      {/* HEADER UTAMA */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between py-4 border-b border-chic-border/30 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-white shadow-md border border-chic-border shadow-pink-100/50">
            <CameraIcon className="w-6 h-6 text-chic-rose animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-chic-dark flex items-baseline gap-1">
              <span className="font-bold tracking-wider">LUMIÈRE</span>
              <span className="font-serif italic font-light text-chic-rose">Booth</span>
            </h1>
            <p className="text-[9px] md:text-[10px] text-chic-gray font-mono tracking-widest">PREMIUM MULTI-POSE EXPERIENCE</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/75 border border-chic-border px-3.5 py-1.5 rounded-xl text-xs text-chic-gray shadow-sm">
          <span className="w-2 h-2 rounded-full bg-chic-rose animate-ping" />
          <span className="font-mono font-medium tracking-wide">STUDIO_ACTIVE</span>
        </div>
      </header>

      {/* TATA LETAK UTAMA */}
      <main className="flex-1 flex items-center justify-center w-full py-4">
        <PhotoBooth />
      </main>

      {/* FOOTER */}
      <footer className="w-full max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between py-6 border-t border-chic-border/30 mt-8 text-xs text-chic-gray gap-4">
        <p>© 2026 Lumière Booth. Didesain secara premium untuk visual optimal.</p>
        <p className="flex items-center gap-1.5">
          <span>Made with</span>
          <Heart className="w-3.5 h-3.5 text-chic-rose fill-current" />
          <span>& 3-Shot Engine</span>
        </p>
      </footer>

    </div>
  );
}

export default App;

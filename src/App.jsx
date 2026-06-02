import React from 'react';
import PhotoBooth from './components/PhotoBooth';
import { Camera as CameraIcon, Heart } from 'lucide-react';

/**
 * Komponen Utama App
 * Menampilkan antarmuka dasar dan merender komponen PhotoBooth terintegrasi.
 */
function App() {
  return (
    <div className="h-screen max-h-screen overflow-hidden bg-chic-gradient bg-grid-chic text-chic-dark flex flex-col justify-between relative px-4 py-3 md:px-6">
      
      {/* HEADER UTAMA */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between py-2 border-b border-chic-border/30 mb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-white shadow-md border border-chic-border shadow-pink-100/50">
            <CameraIcon className="w-5 h-5 text-chic-rose animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-chic-dark flex items-baseline gap-1">
              <span className="font-bold tracking-wider">LUMIÈRE</span>
              <span className="font-serif italic font-light text-chic-rose">Booth</span>
            </h1>
            <p className="text-[8px] md:text-[9px] text-chic-gray font-mono tracking-widest">PREMIUM MULTI-POSE EXPERIENCE</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-white/75 border border-chic-border px-2.5 py-1 rounded-xl text-[10px] text-chic-gray shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-chic-rose animate-ping" />
          <span className="font-mono font-medium tracking-wide">STUDIO_ACTIVE</span>
        </div>
      </header>

      {/* TATA LETAK UTAMA */}
      <main className="flex-1 flex items-center justify-center w-full min-h-0 overflow-hidden py-2">
        <PhotoBooth />
      </main>

      {/* FOOTER */}
      <footer className="w-full max-w-5xl mx-auto flex flex-row items-center justify-between py-2 border-t border-chic-border/30 mt-2 text-[10px] text-chic-gray gap-2">
        <p>© 2026 Lumière Booth.</p>
        <p className="flex items-center gap-1">
          <span>Made with</span>
          <Heart className="w-3 h-3 text-chic-rose fill-current" />
          <span>& 3-Shot Engine</span>
        </p>
      </footer>

    </div>
  );
}

export default App;

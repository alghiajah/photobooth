import React from 'react';
import PhotoBooth from './components/PhotoBooth';
import { Camera as CameraIcon, Heart } from 'lucide-react';

/**
 * Komponen Utama App
 * Menampilkan antarmuka dasar dan merender komponen PhotoBooth terintegrasi.
 */
function App() {
  return (
    <div className="min-h-screen bg-dark-bg bg-grid text-gray-100 flex flex-col justify-between relative px-4 py-6 md:px-8">
      
      {/* HEADER UTAMA */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between py-4 border-b border-dark-border/40 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-r from-neon-purple to-neon-blue shadow-lg shadow-purple-500/10">
            <CameraIcon className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
              NEON<span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple-glow to-neon-blue-glow from-neon-purple to-neon-blue">BOOTH</span>
            </h1>
            <p className="text-[10px] md:text-xs text-gray-400 font-mono">DIGITAL 3-SHOT EXPERIENCE</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-dark-card border border-dark-border px-3 py-1.5 rounded-xl text-xs text-gray-400">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
          <span className="font-mono">SERVER_ONLINE</span>
        </div>
      </header>

      {/* TATA LETAK UTAMA */}
      <main className="flex-1 flex items-center justify-center w-full py-4">
        <PhotoBooth />
      </main>

      {/* FOOTER */}
      <footer className="w-full max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between py-6 border-t border-dark-border/40 mt-8 text-xs text-gray-500 gap-4">
        <p>© 2026 Web Photo Booth. Didesain secara premium untuk visual optimal.</p>
        <p className="flex items-center gap-1.5">
          <span>Made with</span>
          <Heart className="w-3.5 h-3.5 text-red-500 fill-current" />
          <span>& 3-Shot Engine</span>
        </p>
      </footer>

    </div>
  );
}

export default App;

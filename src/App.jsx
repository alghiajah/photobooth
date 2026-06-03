import React, { useState, useEffect } from 'react';
import PhotoBooth from './components/PhotoBooth';
import AuthModal from './components/AuthModal';
import { Camera as CameraIcon, Heart, LogIn, LogOut, User } from 'lucide-react';

/**
 * Komponen Utama App
 * Menampilkan antarmuka dasar, mengelola otentikasi user, dan merender komponen PhotoBooth terintegrasi.
 */
function App() {
  const [user, setUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Muat status login user dari LocalStorage saat inisialisasi
  useEffect(() => {
    const savedUser = localStorage.getItem('booth_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Gagal membaca data user', e);
      }
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('booth_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('booth_user');
  };

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

        {/* Panel Autentikasi User */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2 bg-white/80 border border-chic-border px-3 py-1 rounded-2xl shadow-sm">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-5 h-5 rounded-full object-cover border border-chic-rose bg-chic-blush-soft"
                onError={(e) => {
                  e.target.src = `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`;
                }}
              />
              <span className="text-[10px] font-bold text-chic-dark max-w-[100px] truncate">
                {user.name}
              </span>
              <div className="w-[1px] h-3 bg-chic-border/60 mx-0.5" />
              <button
                onClick={handleLogout}
                title="Keluar Akun"
                className="p-1 rounded-md text-chic-gray hover:text-chic-rose hover:bg-chic-blush-soft transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthOpen(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-chic-rose to-chic-gold text-white px-3 py-1.5 rounded-xl text-[10px] font-bold shadow-sm hover:scale-105 active:scale-95 transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Masuk Studio</span>
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1.5 bg-white/75 border border-chic-border px-2.5 py-1.5 rounded-xl text-[10px] text-chic-gray shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-chic-rose animate-ping" />
            <span className="font-mono font-medium tracking-wide">STUDIO_ACTIVE</span>
          </div>
        </div>
      </header>

      {/* TATA LETAK UTAMA */}
      <main className="flex-1 flex items-center justify-center w-full min-h-0 overflow-hidden py-2">
        <PhotoBooth currentUser={user} />
      </main>

      {/* FOOTER */}
      <footer className="w-full max-w-5xl mx-auto flex flex-row items-center justify-between py-2 border-t border-chic-border/30 mt-2 text-[10px] text-chic-gray gap-2">
        <p>© 2026 Lumière Booth.</p>
        <p className="flex items-center gap-1">
          <span>Made with</span>
          <Heart className="w-3 h-3 text-chic-rose fill-current" />
          <span>& Multi-Grid Engine</span>
        </p>
      </footer>

      {/* MODAL AUTHENTICATION */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

    </div>
  );
}

export default App;


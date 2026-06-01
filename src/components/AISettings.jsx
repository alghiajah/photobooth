import React from 'react';
import { Sparkles, ShieldCheck, Lock, HelpCircle } from 'lucide-react';

/**
 * Komponen AISettings
 * Menyediakan antarmuka untuk mengaktifkan AI Processing Mode, memilih tema AI,
 * dan secara visual menampilkan status Aturan Konsistensi Wajah yang ketat (Strict Face Consistency).
 */
export default function AISettings({
  aiMode,
  setAiMode,
  aiTheme,
  setAiTheme,
}) {
  
  // Daftar Tema Generasi Gambar AI
  const themes = [
    { id: 'cyberpunk', name: 'Cyberpunk Neon', desc: 'Metropolis futuristik dengan pendar cahaya neon ungu & biru' },
    { id: 'retro', name: 'Retro Vintage', desc: 'Nuansa hangat tahun 80-an dengan grain film analog klasik' },
    { id: 'fantasy', name: 'Mystical Fantasy', desc: 'Pencahayaan magis lembut dengan partikel berkilau yang ajaib' }
  ];

  return (
    <div className="w-full flex flex-col gap-5 glass-panel p-5 rounded-2xl border border-dark-border">
      
      {/* Tombol Toggle Aktifkan AI Mode */}
      <div className="flex items-center justify-between pb-4 border-b border-dark-border/40">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl transition-all ${aiMode ? 'bg-neon-purple/20 text-neon-purple' : 'bg-gray-800 text-gray-400'}`}>
            <Sparkles className={`w-5 h-5 ${aiMode ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">AI Transform Mode</h4>
            <p className="text-[11px] text-gray-400">Ubah gaya foto Anda dengan kecerdasan buatan</p>
          </div>
        </div>

        {/* Toggle Switch */}
        <button
          onClick={() => setAiMode(!aiMode)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${
            aiMode ? 'bg-gradient-to-r from-neon-purple to-neon-pink' : 'bg-gray-700'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
              aiMode ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {aiMode && (
        <div className="flex flex-col gap-4 animate-scale-up">
          
          {/* Indikator Konsistensi Wajah Ketat (Strict Face Consistency) - DIWAJIBKAN AKTIF */}
          <div className="bg-neon-purple/5 border border-neon-purple/30 rounded-xl p-3.5 flex items-start gap-3">
            <div className="mt-0.5 p-1 rounded-md bg-neon-purple/10 text-neon-purple">
              <Lock className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">Strict Face Consistency</span>
                <span className="bg-neon-purple text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">Locked</span>
              </div>
              <p className="text-[10px] text-gray-400 leading-relaxed mt-1">
                Aturan AI diaktifkan secara ketat: Fitur & struktur geometris wajah referensi Anda akan dikunci untuk mencegah distorsi. Hanya pose, pencahayaan, dan latar belakang yang diubah sesuai tema.
              </p>
            </div>
          </div>

          {/* Pemilihan Tema AI */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wide">Pilih Gaya Tema AI</label>
            <div className="flex flex-col gap-2.5">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setAiTheme(theme.id)}
                  className={`p-3 rounded-xl text-left border flex items-center justify-between transition-all ${
                    aiTheme === theme.id
                      ? 'border-neon-purple bg-neon-purple/10 text-white shadow-sm'
                      : 'border-dark-border hover:border-gray-600 bg-dark-bg/60 text-gray-300'
                  }`}
                >
                  <div className="flex-1 pr-4">
                    <div className="text-xs font-bold">{theme.name}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5 leading-snug">{theme.desc}</div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    aiTheme === theme.id ? 'border-neon-purple bg-neon-purple' : 'border-gray-500'
                  }`}>
                    {aiTheme === theme.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

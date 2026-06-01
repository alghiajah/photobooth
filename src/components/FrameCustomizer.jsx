import React from 'react';
import { Type, Sparkles, Layout, Palette } from 'lucide-react';

/**
 * Komponen FrameCustomizer
 * Memungkinkan pengguna memilih tipe bingkai (Polaroid, Film Strip, Neon Glow, None),
 * memilih warna bingkai/neon, dan menulis teks kustom untuk polaroid.
 */
export default function FrameCustomizer({
  selectedFrame,
  setSelectedFrame,
  frameColor,
  setFrameColor,
  captionText,
  setCaptionText,
}) {
  
  // Opsi Bingkai yang Tersedia
  const frames = [
    { id: 'none', name: 'Tanpa Bingkai', desc: 'Foto asli murni' },
    { id: 'polaroid', name: 'Polaroid Classic', desc: 'Gaya vintage polaroid putih' },
    { id: 'filmstrip', name: 'Film Strip', desc: 'Strip film analog hitam' },
    { id: 'neon', name: 'Neon Glow', desc: 'Pendaran cahaya neon digital' }
  ];

  // Palet Warna Berdasarkan Bingkai yang Dipilih
  const getColorOptions = () => {
    if (selectedFrame === 'polaroid') {
      return [
        { id: '#ffffff', name: 'Classic White', bg: 'bg-white' },
        { id: '#fcf6f5', name: 'Warm Paper', bg: 'bg-[#fcf6f5] border border-gray-300' },
        { id: '#ffccd5', name: 'Blush Pink', bg: 'bg-[#ffccd5]' },
        { id: '#c8e6c9', name: 'Mint Green', bg: 'bg-[#c8e6c9]' },
        { id: '#bbdefb', name: 'Sky Blue', bg: 'bg-[#bbdefb]' },
        { id: '#1a1a24', name: 'Midnight', bg: 'bg-[#1a1a24] border border-white/10' }
      ];
    } else if (selectedFrame === 'filmstrip') {
      return [
        { id: '#0b0b0e', name: 'Classic Black', bg: 'bg-[#0b0b0e] border border-white/10' },
        { id: '#f4f3ec', name: 'Retro Bone', bg: 'bg-[#f4f3ec]' },
        { id: '#7a1c1c', name: 'Dark Red', bg: 'bg-[#7a1c1c]' },
        { id: '#0f3a20', name: 'Forest', bg: 'bg-[#0f3a20]' }
      ];
    } else if (selectedFrame === 'neon') {
      return [
        { id: '#a855f7', name: 'Purple Glow', bg: 'bg-purple-500' },
        { id: '#06b6d4', name: 'Cyan Glow', bg: 'bg-cyan-500' },
        { id: '#ec4899', name: 'Pink Glow', bg: 'bg-pink-500' },
        { id: '#22c55e', name: 'Green Glow', bg: 'bg-green-500' },
        { id: '#eab308', name: 'Yellow Glow', bg: 'bg-yellow-500' }
      ];
    }
    return [];
  };

  const colors = getColorOptions();

  return (
    <div className="w-full flex flex-col gap-6">
      
      {/* 1. Pilih Tipe Bingkai */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-300">
          <Layout className="w-4 h-4 text-neon-purple" />
          <span>Pilih Desain Bingkai (Frame)</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {frames.map((frame) => (
            <button
              key={frame.id}
              onClick={() => {
                setSelectedFrame(frame.id);
                // Set warna default saat mengganti bingkai
                if (frame.id === 'polaroid') setFrameColor('#ffffff');
                if (frame.id === 'filmstrip') setFrameColor('#0b0b0e');
                if (frame.id === 'neon') setFrameColor('#a855f7');
              }}
              className={`p-3 rounded-xl text-left border transition-all duration-200 ${
                selectedFrame === frame.id
                  ? 'border-neon-purple bg-neon-purple/5 shadow-md shadow-purple-500/5'
                  : 'border-dark-border hover:border-gray-600 bg-dark-card/50'
              }`}
            >
              <div className="font-bold text-sm text-white">{frame.name}</div>
              <div className="text-[11px] text-gray-400 mt-1 leading-snug">{frame.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {selectedFrame !== 'none' && (
        <>
          {/* 2. Pilih Warna Bingkai */}
          {colors.length > 0 && (
            <div className="flex flex-col gap-3 animate-scale-up">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                <Palette className="w-4 h-4 text-neon-blue" />
                <span>Warna Tema Bingkai</span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {colors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setFrameColor(color.id)}
                    title={color.name}
                    className={`w-8 h-8 rounded-full ${color.bg} transition-all duration-150 ${
                      frameColor === color.id
                        ? 'ring-4 ring-offset-2 ring-offset-dark-bg ring-neon-blue scale-110'
                        : 'hover:scale-105 hover:opacity-90'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 3. Input Caption untuk Polaroid */}
          {selectedFrame === 'polaroid' && (
            <div className="flex flex-col gap-3 animate-scale-up">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                <Type className="w-4 h-4 text-neon-pink" />
                <span>Tulis Catatan Polaroid</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  maxLength={30}
                  value={captionText}
                  onChange={(e) => setCaptionText(e.target.value)}
                  placeholder="Ketik memo singkat di sini..."
                  className="w-full bg-dark-input border border-dark-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-neon-pink placeholder-gray-500"
                />
                <span className="absolute right-3 top-3.5 text-[10px] font-mono text-gray-500">
                  {captionText.length}/30
                </span>
              </div>
              <p className="text-[10px] text-gray-400 leading-normal">
                Memo ini akan ditulis dengan gaya tulisan tangan di bagian bawah frame polaroid Anda.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

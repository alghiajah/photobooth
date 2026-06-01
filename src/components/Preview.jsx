import React, { useRef, useEffect, useState } from 'react';
import { Download, RotateCcw, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { generateAIImage } from '../services/aiService';

/**
 * Komponen Preview
 * Menggambar hasil foto gabungan dengan bingkai dan teks secara real-time pada canvas,
 * mengelola pengunduhan gambar, serta pemrosesan AI (Face Consistency Mode).
 */
export default function Preview({
  rawImage,
  onRetake,
  selectedFrame,
  frameColor,
  captionText,
  aiMode,
  aiTheme,
}) {
  const canvasRef = useRef(null);
  const [displayImage, setDisplayImage] = useState(rawImage);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiError, setAiError] = useState('');
  const [loadingStep, setLoadingStep] = useState(0);

  // Kata-kata loading interaktif bergaya AI
  const loadingSteps = [
    "Menganalisis struktur wajah asli...",
    "Mengunci fitur identitas referensi (Face Consistency)...",
    "Menghapus latar belakang...",
    "Menghasilkan pencahayaan tema baru...",
    "Merender latar belakang cyberpunk/retro/fantasy...",
    "Menggabungkan elemen tanpa distorsi wajah...",
    "Sentuhan akhir..."
  ];

  // Efek rotasi teks loading
  useEffect(() => {
    if (!isAiProcessing) return;
    setLoadingStep(0);
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % loadingSteps.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [isAiProcessing]);

  // Menggambar gambar dan bingkai ke Canvas secara Real-Time
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // 1. Tentukan Ukuran Canvas Berdasarkan Jenis Bingkai
      let canvasWidth = img.width;
      let canvasHeight = img.height;

      if (selectedFrame === 'polaroid') {
        // Polaroid memiliki ruang tambahan yang tebal di bagian bawah
        canvasWidth = 1080;
        canvasHeight = 1350; // Aspek rasio 4:5
      } else if (selectedFrame === 'filmstrip') {
        canvasWidth = 1280;
        canvasHeight = 960;
      } else if (selectedFrame === 'neon') {
        canvasWidth = 1200;
        canvasHeight = 900;
      }

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // Bersihkan canvas
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // 2. Gambar Bingkai & Foto
      if (selectedFrame === 'none') {
        // Tanpa bingkai: Gambar foto penuh
        ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

      } else if (selectedFrame === 'polaroid') {
        // Bingkai Polaroid Classic
        ctx.fillStyle = frameColor || '#ffffff';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Gambar foto di area atas (beri margin)
        const marginX = 80;
        const marginTop = 80;
        const photoWidth = canvasWidth - (marginX * 2);
        const photoHeight = canvasHeight - (marginTop * 2) - 200; // Sisakan 200px di bawah untuk teks
        ctx.drawImage(img, marginX, marginTop, photoWidth, photoHeight);

        // Tambahkan bayangan tipis di dalam foto agar terlihat realistis
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.lineWidth = 4;
        ctx.strokeRect(marginX, marginTop, photoWidth, photoHeight);

        // Tambahkan Teks Memo Polaroid di bagian bawah
        ctx.save();
        ctx.fillStyle = frameColor === '#1a1a24' ? '#f3f4f6' : '#27272a'; // Teks putih untuk bingkai gelap, hitam untuk terang
        ctx.textAlign = 'center';
        
        // Memo Teks (Menggunakan Font Tulisan Tangan 'Pacifico')
        ctx.font = "46px 'Pacifico', cursive";
        const textY = canvasHeight - 110;
        ctx.fillText(captionText || 'Awesome Memories ✨', canvasWidth / 2, textY);

        // Tanggal & Waktu di pojok kanan bawah
        const now = new Date();
        const dateString = now.toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' });
        const timeString = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        
        ctx.font = "20px 'Outfit', sans-serif";
        ctx.textAlign = 'right';
        ctx.fillStyle = frameColor === '#1a1a24' ? '#9ca3af' : '#71717a';
        ctx.fillText(`${dateString} | ${timeString}`, canvasWidth - marginX, canvasHeight - 40);
        ctx.restore();

      } else if (selectedFrame === 'filmstrip') {
        // Bingkai Film Strip Analog
        ctx.fillStyle = frameColor || '#0b0b0e';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Lubang-lubang film di sisi kiri dan kanan (Sprocket Holes)
        const holeWidth = 24;
        const holeHeight = 36;
        const holeSpacing = 50;
        const holeColor = '#050507'; // Hitam pekat (lubang tembus pandang)

        ctx.fillStyle = holeColor;
        // Gambar lubang-lubang
        for (let y = 30; y < canvasHeight - 30; y += holeSpacing + holeHeight) {
          // Sisi Kiri
          ctx.fillRect(25, y, holeWidth, holeHeight);
          // Sisi Kanan
          ctx.fillRect(canvasWidth - 25 - holeWidth, y, holeWidth, holeHeight);
        }

        // Area Foto di Tengah
        const borderLeft = 80;
        const photoWidth = canvasWidth - (borderLeft * 2);
        const photoHeight = canvasHeight - 100;
        ctx.drawImage(img, borderLeft, 50, photoWidth, photoHeight);

        // Teks Tanggal Retro di Sisi Bawah Film Strip
        ctx.save();
        ctx.fillStyle = '#ea580c'; // Warna orange neon khas kamera digital kuno
        ctx.font = "bold 24px 'Courier New', monospace";
        ctx.textAlign = 'right';
        const now = new Date();
        const formattedDate = now.toLocaleDateString('en-US', { 
          year: '2-digit', 
          month: '2-digit', 
          day: '2-digit' 
        }).replace(/\//g, ' '); // Format MM DD YY
        ctx.fillText(`'26 ${formattedDate}`, canvasWidth - 110, canvasHeight - 80);
        ctx.restore();

      } else if (selectedFrame === 'neon') {
        // Bingkai Neon Glow
        // Pertama, gambar foto memenuhi canvas
        ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

        // Gambar border neon luar
        ctx.save();
        ctx.strokeStyle = frameColor || '#a855f7';
        ctx.lineWidth = 16;
        
        // Atur efek bayangan berpendar (Glow)
        ctx.shadowColor = frameColor || '#a855f7';
        ctx.shadowBlur = 30;
        
        // Gambar border persegi panjang di sekeliling foto
        ctx.strokeRect(8, 8, canvasWidth - 16, canvasHeight - 16);
        ctx.restore();

        // Tambahkan Watermark Neon di pojok kiri atas
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.font = "bold 20px 'Outfit', sans-serif";
        ctx.shadowColor = frameColor || '#a855f7';
        ctx.shadowBlur = 10;
        ctx.fillText("NEON_BOOTH_2.0", 30, 45);
        ctx.restore();
      }
    };

    img.src = displayImage;
  };

  // Gambar ulang canvas setiap kali state pendukung berubah
  useEffect(() => {
    drawCanvas();
  }, [displayImage, selectedFrame, frameColor, captionText]);

  // Fungsi Mengunduh Hasil Foto
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Ambil timestamp untuk nama file yang unik
    const ts = new Date().toISOString().slice(0, 19).replace(/[-:]/g, "");
    const link = document.createElement('a');
    link.download = `photobooth-${ts}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Memicu Pemrosesan AI
  const handleAiTransform = async () => {
    setIsAiProcessing(true);
    setAiError('');
    try {
      // Mengirimkan base64 asli, tema terpilih, dan memaksa face consistency = true
      const resultImage = await generateAIImage(rawImage, aiTheme, true);
      setDisplayImage(resultImage);
    } catch (err) {
      console.error(err);
      setAiError('Gagal memproses gambar AI: ' + err.message);
    } finally {
      setIsAiProcessing(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row items-stretch justify-center gap-8 w-full max-w-5xl mx-auto p-4 animate-scale-up">
      
      {/* Kolom Kiri: Canvas Pratinjau (Responsive Max Width) */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        
        {/* Loading Overlay Saat AI Memproses */}
        {isAiProcessing && (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center text-center p-6 bg-black/85 backdrop-blur-md rounded-2xl border border-neon-purple/40">
            <RefreshCw className="w-16 h-16 text-neon-purple animate-spin mb-6" />
            <h3 className="text-xl font-bold text-white mb-2">Sedang Mentransformasi Foto</h3>
            <p className="text-neon-purple-glow text-neon-purple font-mono text-xs uppercase tracking-widest mb-4">
              AI Theme Mode: {aiTheme}
            </p>
            <div className="w-64 h-1.5 bg-dark-border rounded-full overflow-hidden mb-6">
              <div className="h-full bg-gradient-to-r from-neon-purple to-neon-blue rounded-full animate-pulse w-4/5" />
            </div>
            <p className="text-gray-300 text-sm font-medium animate-pulse max-w-xs leading-relaxed">
              {loadingSteps[loadingStep]}
            </p>
          </div>
        )}

        {/* Canvas Render Bingkai Real-Time */}
        <div className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-dark-border bg-dark-bg p-2 flex items-center justify-center">
          <canvas
            ref={canvasRef}
            className="w-full h-auto object-contain rounded-lg max-h-[70vh] shadow-lg"
          />
        </div>
        
        {/* Error Indikator jika AI Gagal */}
        {aiError && (
          <div className="mt-4 flex items-center gap-2 text-sm text-red-400 bg-red-950/40 border border-red-950 p-3 rounded-xl w-full">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{aiError}</span>
          </div>
        )}
      </div>

      {/* Kolom Kanan: Panel Kontrol Akhir */}
      <div className="w-full lg:w-80 flex flex-col justify-between gap-6 glass-panel p-6 rounded-3xl border border-dark-border">
        <div className="flex flex-col gap-6">
          <div>
            <h3 className="text-xl font-bold text-white">Hasil Foto Booth</h3>
            <p className="text-xs text-gray-400 mt-1">Sesuaikan bingkai dan download hasil karya Anda.</p>
          </div>

          {/* Tombol AI Transform (Hanya tampil jika Mode AI aktif di State Utama) */}
          {aiMode && (
            <div className="flex flex-col gap-2 p-4 rounded-2xl border border-neon-purple/20 bg-neon-purple/5">
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-neon-purple" />
                <span>Siap untuk AI Transform?</span>
              </div>
              <p className="text-[10px] text-gray-400 leading-normal">
                Ubah latar belakang dan pencahayaan foto Anda ke tema <span className="text-neon-purple font-semibold capitalize">{aiTheme}</span> dengan perlindungan wajah ketat.
              </p>
              <button
                onClick={handleAiTransform}
                disabled={isAiProcessing}
                className="mt-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-neon-purple to-neon-pink text-white text-xs font-bold shadow-lg hover:shadow-purple-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Jalankan AI Transform
              </button>
            </div>
          )}
        </div>

        {/* Tombol Aksi Utama */}
        <div className="flex flex-col gap-3 mt-6">
          <button
            onClick={handleDownload}
            disabled={isAiProcessing}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple text-white font-bold text-sm shadow-lg hover:shadow-cyan-500/10 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2.5"
          >
            <Download className="w-4 h-4" />
            Unduh Foto (PNG)
          </button>
          
          <button
            onClick={onRetake}
            disabled={isAiProcessing}
            className="w-full py-3 rounded-xl bg-dark-bg border border-dark-border text-gray-300 hover:text-white hover:bg-gray-800/40 font-bold text-sm transition-all flex items-center justify-center gap-2.5"
          >
            <RotateCcw className="w-4 h-4" />
            Ambil Ulang Foto
          </button>
        </div>
      </div>
    </div>
  );
}

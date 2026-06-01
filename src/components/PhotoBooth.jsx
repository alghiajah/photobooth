import React, { useState, useEffect, useRef } from 'react';
import { Camera, AlertCircle, RefreshCw, Download, RotateCcw, Zap, Play } from 'lucide-react';

/**
 * =========================================================================
 * KONFIGURASI KOORDINAT PENGGABUNGAN FOTO DI CANVAS
 * 
 * Anda dapat mengedit nilai-nilai di bawah ini untuk mencocokkan koordinat 
 * lubang (transparent windows) pada desain bingkai (/assets/frame.png) Anda.
 * =========================================================================
 */
const CANVAS_WIDTH = 1200;   // Lebar total kanvas hasil akhir (dalam piksel)
const CANVAS_HEIGHT = 1800;  // Tinggi total kanvas hasil akhir (dalam piksel)

const PHOTO_WIDTH = 1000;    // Lebar masing-masing dari ke-3 foto pada kanvas
const PHOTO_HEIGHT = 450;    // Tinggi masing-masing dari ke-3 foto pada kanvas
const PHOTO_X = 100;         // Posisi X (horizontal) foto (tengah secara horizontal: (1200 - 1000) / 2)

// Posisi Y (vertikal) untuk masing-masing foto (Jepretan 1, 2, dan 3)
const PHOTO_Y_COORDS = [
  120,   // Jepretan 1 (Foto paling atas)
  630,   // Jepretan 2 (Foto di tengah)
  1140   // Jepretan 3 (Foto paling bawah)
];

// Warna Latar Belakang Kanvas (Background Layer dasar di bawah foto)
const CANVAS_BG_COLOR = "#ffffff"; 

// Path Gambar Bingkai Eksternal Anda (Mendukung Subdirektori GitHub Pages)
const FRAME_IMAGE_PATH = import.meta.env.BASE_URL + "assets/frame.png";
/**
 * =========================================================================
 */

export default function PhotoBooth() {
  const videoRef = useRef(null);
  const tempCanvasRef = useRef(null);
  const resultCanvasRef = useRef(null);
  const streamRef = useRef(null);

  // State Manajemen Kamera & Siklus
  const [step, setStep] = useState('camera'); // 'camera' | 'preview'
  const [hasPermission, setHasPermission] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [isCameraReady, setIsCameraReady] = useState(false);

  // State Pengambilan Foto Beruntun (3-Shot Loop)
  const [photos, setPhotos] = useState([]); // Menampung 3 base64 foto
  const [isCapturing, setIsCapturing] = useState(false);
  const [currentShot, setCurrentShot] = useState(0); // 1, 2, 3
  const [countdown, setCountdown] = useState(null); // 3, 2, 1, null
  const [isFlashActive, setIsFlashActive] = useState(false);

  // Helfer fungsi jeda (sleep) menggunakan Promise
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // 1. Mengambil Perangkat Kamera yang Tersedia
  const getCameras = async () => {
    try {
      const devicesInfo = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devicesInfo.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices);
      if (videoDevices.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
    } catch (err) {
      console.error("Gagal mendeteksi perangkat kamera:", err);
    }
  };

  // 2. Menyalakan Stream Kamera
  const startCamera = async () => {
    setIsCameraReady(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    const constraints = {
      video: {
        deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      },
      audio: false
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasPermission(true);
      setIsCameraReady(true);
      setErrorMsg('');
      if (devices.length === 0) {
        await getCameras();
      }
    } catch (err) {
      console.error("Gagal mengakses WebRTC kamera:", err);
      setHasPermission(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMsg("Izin kamera ditolak. Silakan izinkan browser mengakses kamera Anda melalui address bar.");
      } else {
        setErrorMsg(`Kesalahan akses kamera: ${err.message}`);
      }
    }
  };

  useEffect(() => {
    if (step === 'camera') {
      startCamera();
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [selectedDeviceId, step]);

  // 3. Menangkap Frame Tunggal dari Video
  const captureFrame = () => {
    if (!videoRef.current || !tempCanvasRef.current) return null;
    const video = videoRef.current;
    const canvas = tempCanvasRef.current;
    const ctx = canvas.getContext('2d');

    const vWidth = video.videoWidth;
    const vHeight = video.videoHeight;
    canvas.width = vWidth;
    canvas.height = vHeight;

    // Terapkan Efek Mirror (Dibalik secara Horizontal)
    ctx.translate(vWidth, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, vWidth, vHeight);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    return canvas.toDataURL('image/jpeg', 0.95);
  };

  // 4. Siklus Pengambilan 3 Foto Beruntun (3-Shot Loop)
  const startCaptureSession = async () => {
    if (!isCameraReady || isCapturing) return;

    setIsCapturing(true);
    setPhotos([]);
    
    // Perulangan mengambil 3 foto
    for (let shot = 1; shot <= 3; shot++) {
      setCurrentShot(shot);

      // Hitung Mundur 3.. 2.. 1..
      for (let count = 3; count >= 1; count--) {
        setCountdown(count);
        await sleep(1000);
      }
      setCountdown(null);

      // Efek Kilatan Flash
      setIsFlashActive(true);
      const photoData = captureFrame();
      
      // Matikan flash setelah 250ms
      setTimeout(() => {
        setIsFlashActive(false);
      }, 250);

      // Tambahkan foto ke state array
      if (photoData) {
        setPhotos(prev => [...prev, photoData]);
      }

      // Jeda 1.5 detik agar pengguna bersiap untuk pose berikutnya (kecuali setelah jepretan terakhir)
      if (shot < 3) {
        await sleep(1500);
      }
    }

    setIsCapturing(false);
    setStep('preview');
  };

  // 5. Menggambar Gabungan (Canvas Merging) setelah 3 Foto Diambil
  // Mendeteksi batas kiri dan kanan dari strip berwarna untuk menghilangkan margin putih
  const detectStripBoundaries = (frameImg) => {
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(frameImg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const imgData = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const data = imgData.data;

    let leftBoundary = CANVAS_WIDTH;
    let rightBoundary = 0;

    // Deteksi warna non-putih
    for (let y = 0; y < CANVAS_HEIGHT; y++) {
      for (let x = 0; x < CANVAS_WIDTH; x++) {
        const idx = (y * CANVAS_WIDTH + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const a = data[idx + 3];

        // Piksel dianggap bagian dari strip jika tidak berwarna putih bersih dan memiliki alpha solid
        const isWhite = r > 240 && g > 240 && b > 240;
        if (!isWhite && a > 50) {
          if (x < leftBoundary) leftBoundary = x;
          if (x > rightBoundary) rightBoundary = x;
        }
      }
    }

    // Beri toleransi margin aman 8 piksel agar tidak memotong bayangan bingkai
    leftBoundary = Math.max(0, leftBoundary - 8);
    rightBoundary = Math.min(CANVAS_WIDTH - 1, rightBoundary + 8);
    const width = rightBoundary - leftBoundary;

    // Jika deteksi gagal (misal gambar putih polos), gunakan lebar penuh
    if (width < 200 || leftBoundary >= rightBoundary) {
      return { left: 0, right: CANVAS_WIDTH, width: CANVAS_WIDTH };
    }

    return { left: leftBoundary, right: rightBoundary, width };
  };

  // Memindai gambar bingkai secara real-time untuk mendeteksi letak kotak hijau
  const detectGreenSlots = (frameImg) => {
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(frameImg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const imgData = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const data = imgData.data;

    // Deteksi warna hijau neon
    const isGreen = (r, g, b, a) => {
      return g > 130 && g > r * 1.4 && g > b * 1.4 && a > 100;
    };

    // Tandai baris yang memiliki piksel hijau
    const greenRows = new Array(CANVAS_HEIGHT).fill(false);
    for (let y = 0; y < CANVAS_HEIGHT; y++) {
      for (let x = 0; x < CANVAS_WIDTH; x++) {
        const idx = (y * CANVAS_WIDTH + x) * 4;
        if (isGreen(data[idx], data[idx + 1], data[idx + 2], data[idx + 3])) {
          greenRows[y] = true;
          break;
        }
      }
    }

    // Kelompokkan baris hijau berurutan untuk mencari batas Y
    const yRanges = [];
    let inRange = false;
    let startY = 0;

    for (let y = 0; y < CANVAS_HEIGHT; y++) {
      if (greenRows[y] && !inRange) {
        inRange = true;
        startY = y;
      } else if (!greenRows[y] && inRange) {
        inRange = false;
        const rangeHeight = y - startY;
        if (rangeHeight > 25) {
          yRanges.push({ start: startY, end: y - 1 });
        }
      }
    }
    if (inRange) {
      const rangeHeight = CANVAS_HEIGHT - startY;
      if (rangeHeight > 25) {
        yRanges.push({ start: startY, end: CANVAS_HEIGHT - 1 });
      }
    }

    // Cari koordinat X untuk masing-masing rentang Y yang terdeteksi
    const detectedSlots = [];
    yRanges.forEach((yRange) => {
      let minX = CANVAS_WIDTH;
      let maxX = 0;

      for (let y = yRange.start; y <= yRange.end; y++) {
        for (let x = 0; x < CANVAS_WIDTH; x++) {
          const idx = (y * CANVAS_WIDTH + x) * 4;
          if (isGreen(data[idx], data[idx + 1], data[idx + 2], data[idx + 3])) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
          }
        }
      }

      const slotWidth = maxX - minX + 1;
      const slotHeight = yRange.end - yRange.start + 1;

      if (slotWidth > 30 && slotHeight > 30) {
        detectedSlots.push({
          x: minX,
          y: yRange.start,
          width: slotWidth,
          height: slotHeight
        });
      }
    });

    return detectedSlots.sort((a, b) => a.y - b.y);
  };

  const drawMergedCanvas = () => {
    const canvas = resultCanvasRef.current;
    if (!canvas || photos.length < 3) return;

    const ctx = canvas.getContext('2d');

    // Muat bingkai gambar terlebih dahulu
    const frameImg = new Image();
    frameImg.onload = () => {
      // 1. Deteksi batas strip (crop margin putih)
      const boundaries = detectStripBoundaries(frameImg);
      
      // Sesuaikan lebar canvas hanya seukuran strip saja!
      canvas.width = boundaries.width;
      canvas.height = CANVAS_HEIGHT;

      // 2. Jalankan deteksi otomatis koordinat hijau pada bingkai
      const detectedSlots = detectGreenSlots(frameImg);
      console.log("Sistem mendeteksi slot hijau:", detectedSlots);
      console.log("Batas strip terdeteksi:", boundaries);

      // Muat ketiga foto jepretan
      let loadedCount = 0;
      const imgElements = photos.map((src) => {
        const img = new Image();
        img.onload = () => {
          loadedCount++;
          if (loadedCount === 3) {
            // Gambar semua layer setelah foto termuat
            renderLayers(imgElements, detectedSlots, boundaries, frameImg, ctx);
          }
        };
        img.src = src;
        return img;
      });
    };

    frameImg.onerror = () => {
      console.warn("Berkas bingkai eksternal gagal dimuat. Menggunakan render bingkai Fallback.");
      canvas.width = CANVAS_WIDTH;
      canvas.height = CANVAS_HEIGHT;
      let loadedCount = 0;
      const imgElements = photos.map((src) => {
        const img = new Image();
        img.onload = () => {
          loadedCount++;
          if (loadedCount === 3) {
            renderLayersDefault(imgElements, ctx);
            drawFallbackFrame(ctx);
          }
        };
        img.src = src;
        return img;
      });
    };

    frameImg.src = FRAME_IMAGE_PATH;
  };

  // Rendering utama dengan deteksi koordinat otomatis (Auto-Fit) & Auto-Crop
  const renderLayers = (images, slots, boundaries, frameImg, ctx) => {
    // Bersihkan canvas seukuran lebar strip yang baru
    ctx.fillStyle = CANVAS_BG_COLOR;
    ctx.fillRect(0, 0, boundaries.width, CANVAS_HEIGHT);

    // 1. Gambar foto-foto di koordinat yang terdeteksi (digeser berdasarkan batas kiri strip)
    images.forEach((img, index) => {
      const useDefault = slots.length !== 3;
      const slot = useDefault 
        ? { x: PHOTO_X, y: PHOTO_Y_COORDS[index], width: PHOTO_WIDTH, height: PHOTO_HEIGHT }
        : slots[index];

      // Beri bleed 4px (perbesaran kecil) agar foto masuk sedikit di bawah bingkai
      const bleed = 4;
      
      // PENTING: Geser koordinat X foto ke kiri sebesar batas kiri strip agar sejajar dengan kanvas yang dipotong
      const x = (slot.x - boundaries.left) - bleed;
      const y = slot.y - bleed;
      const w = slot.width + (bleed * 2);
      const h = slot.height + (bleed * 2);

      // Logika Crop Center-Fit
      const imgRatio = img.width / img.height;
      const targetRatio = w / h;
      let sx, sy, sWidth, sHeight;

      if (imgRatio > targetRatio) {
        sHeight = img.height;
        sWidth = img.height * targetRatio;
        sx = (img.width - sWidth) / 2;
        sy = 0;
      } else {
        sWidth = img.width;
        sHeight = img.width / targetRatio;
        sx = 0;
        sy = (img.height - sHeight) / 2;
      }

      ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, w, h);
    });

    // 2. Gambar bingkai dengan filter chroma key (hanya mengambil bagian strip tengah saja)
    const frameCanvas = document.createElement('canvas');
    frameCanvas.width = CANVAS_WIDTH;
    frameCanvas.height = CANVAS_HEIGHT;
    const frameCtx = frameCanvas.getContext('2d');
    frameCtx.drawImage(frameImg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const frameData = frameCtx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const data = frameData.data;

    // Deteksi warna hijau neon
    const isGreen = (r, g, b, a) => {
      return g > 130 && g > r * 1.4 && g > b * 1.4 && a > 100;
    };

    // Bersihkan warna hijau neon di sekeliling lubang agar transparan
    for (let i = 0; i < data.length; i += 4) {
      if (isGreen(data[i], data[i + 1], data[i + 2], data[i + 3])) {
        data[i + 3] = 0; // Setel transparansi penuh
      }
    }

    frameCtx.putImageData(frameData, 0, 0);

    // Gambar hanya area strip hasil crop dari frameCanvas ke canvas utama
    ctx.drawImage(
      frameCanvas, 
      boundaries.left, 0, boundaries.width, CANVAS_HEIGHT, // Source region (hanya strip tengah)
      0, 0, boundaries.width, CANVAS_HEIGHT                 // Destination region (mengisi penuh kanvas baru)
    );
  };

  // Render cadangan menggunakan koordinat default (jika gambar gagal dimuat)
  const renderLayersDefault = (images, ctx) => {
    images.forEach((img, index) => {
      const x = PHOTO_X;
      const y = PHOTO_Y_COORDS[index];
      const w = PHOTO_WIDTH;
      const h = PHOTO_HEIGHT;

      const imgRatio = img.width / img.height;
      const targetRatio = w / h;
      let sx, sy, sWidth, sHeight;

      if (imgRatio > targetRatio) {
        sHeight = img.height;
        sWidth = img.height * targetRatio;
        sx = (img.width - sWidth) / 2;
        sy = 0;
      } else {
        sWidth = img.width;
        sHeight = img.width / targetRatio;
        sx = 0;
        sy = (img.height - sHeight) / 2;
      }

      ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, w, h);
    });
  };

  // Menggambar Bingkai Fallback jika gambar eksternal tidak ditemukan
  const drawFallbackFrame = (ctx) => {
    ctx.save();
    
    // Terapkan border luar strip film hitam mewah
    ctx.fillStyle = "#111116";
    
    // Gambar bingkai samping kiri dan kanan (menghasilkan efek strip film analog)
    const sideMargin = 70;
    ctx.fillRect(0, 0, sideMargin, CANVAS_HEIGHT);
    ctx.fillRect(CANVAS_WIDTH - sideMargin, 0, sideMargin, CANVAS_HEIGHT);
    ctx.fillRect(0, 0, CANVAS_WIDTH, 90);
    ctx.fillRect(0, CANVAS_HEIGHT - 120, CANVAS_WIDTH, 120);

    // Menggambar Lubang Sprocket (Lubang khas strip film analog)
    ctx.fillStyle = "#050507";
    const sprocketWidth = 20;
    const sprocketHeight = 30;
    const sprocketSpacing = 40;

    for (let y = 30; y < CANVAS_HEIGHT - 30; y += sprocketHeight + sprocketSpacing) {
      ctx.fillRect(25, y, sprocketWidth, sprocketHeight);
      ctx.fillRect(CANVAS_WIDTH - 25 - sprocketWidth, y, sprocketWidth, sprocketHeight);
    }

    // Tulis cap air tanggal/waktu retro oranye di bagian bawah kanvas
    ctx.fillStyle = "#ea580c"; // Oranye retro digital
    ctx.font = "bold 26px 'Courier New', monospace";
    ctx.textAlign = "right";
    const now = new Date();
    const formattedDate = now.toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' });
    const formattedTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    ctx.fillText(`${formattedDate} ${formattedTime} | PHOTOBOOTH_3X_SHOTS`, CANVAS_WIDTH - sideMargin - 30, CANVAS_HEIGHT - 50);

    ctx.restore();
  };

  // Efek gambar kanvas dipicu ketika langkah pratinjau aktif
  useEffect(() => {
    if (step === 'preview' && photos.length === 3) {
      // Tunggu DOM termuat untuk kanvas, lalu gambar
      setTimeout(drawMergedCanvas, 100);
    }
  }, [step, photos]);

  // 6. Navigasi Aksi: Unduh & Ambil Ulang
  const handleDownload = () => {
    const canvas = resultCanvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'photobooth-session.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleRetake = () => {
    setPhotos([]);
    setStep('camera');
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-6">
      
      {/* ---------------- TAMPILAN KAMERA ---------------- */}
      {step === 'camera' && (
        <div className="w-full flex flex-col items-center gap-4">
          <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-dark-border bg-black glass-panel-glow">
            
            {/* Flash Overlay Effect */}
            {isFlashActive && (
              <div className="absolute inset-0 z-50 animate-flash" />
            )}

            {/* Izin Loading Kamera */}
            {hasPermission === null && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-3">
                <RefreshCw className="w-12 h-12 animate-spin text-neon-purple" />
                <p className="text-sm font-semibold tracking-wider font-mono">Memuat Kamera WebRTC...</p>
              </div>
            )}

            {/* Kamera Gagal Diakses */}
            {hasPermission === false && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-dark-bg/95">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4 animate-bounce" />
                <h3 className="text-xl font-bold text-white mb-2">Akses Kamera Dibatalkan</h3>
                <p className="text-gray-400 max-w-md text-xs leading-relaxed mb-6">{errorMsg}</p>
                <button 
                  onClick={startCamera}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-neon-purple to-neon-pink text-white text-sm font-bold hover:scale-105 transition-transform"
                >
                  Hubungkan Ulang
                </button>
              </div>
            )}

            {/* Video Stream */}
            {hasPermission === true && (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
            )}

            {/* Countdown Overlay */}
            {countdown !== null && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs z-30">
                <div className="text-9xl font-extrabold text-neon-purple text-neon-purple-glow animate-countdown">
                  {countdown}
                </div>
              </div>
            )}

            {/* Visual Indikator Jepretan & Kamera Aktif */}
            {hasPermission === true && (
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4">
                <div className="flex justify-between w-full text-xs font-mono text-white/55">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full bg-red-500 ${isCapturing ? 'animate-pulse' : ''}`} />
                    <span>{isCapturing ? 'CAPTURING_SESSION' : 'STANDBY'}</span>
                  </div>
                  <div>3_CONSECUTIVE_SHOTS</div>
                </div>

                {isCapturing && (
                  <div className="self-center bg-black/75 px-5 py-2.5 rounded-2xl border border-neon-purple/40 text-center backdrop-blur-md">
                    <p className="text-[10px] text-gray-400 font-mono tracking-wider uppercase">Sedang Berjalan</p>
                    <p className="text-sm font-extrabold text-white">Jepretan ke-{currentShot} dari 3</p>
                  </div>
                )}

                <div className="flex justify-between w-full text-xs font-mono text-white/30">
                  <div>1080P FHD</div>
                  <div>DEVICE: ACTIVE</div>
                </div>
              </div>
            )}
          </div>

          {/* Canvas Penyimpan Sementara */}
          <canvas ref={tempCanvasRef} className="hidden" />

          {/* Panel Kontrol Pengambilan Foto */}
          {hasPermission === true && (
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-dark-border">
              {/* Pemilih Kamera */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-mono text-gray-400">INPUT:</span>
                {devices.length > 1 ? (
                  <select
                    value={selectedDeviceId}
                    onChange={(e) => setSelectedDeviceId(e.target.value)}
                    className="bg-dark-input text-gray-200 border border-dark-border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-neon-purple"
                  >
                    {devices.map((device, idx) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Camera ${idx + 1}`}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-xs font-bold text-gray-300">
                    {devices[0]?.label || "Kamera Utama"}
                  </span>
                )}
              </div>

              {/* Tombol Mulai Ambil 3 Foto */}
              <button
                onClick={startCaptureSession}
                disabled={!isCameraReady || isCapturing}
                className="flex items-center justify-center gap-3 px-8 py-3.5 rounded-full bg-gradient-to-r from-neon-purple to-neon-blue text-white font-extrabold text-base shadow-lg shadow-purple-500/10 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all w-full sm:w-auto"
              >
                <Play className="w-5 h-5 fill-current" />
                Mulai Jepret (3x)
              </button>

              {/* Status Mini */}
              <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
                <Zap className={`w-4 h-4 ${isCameraReady ? 'text-neon-blue' : 'text-gray-600'}`} />
                <span>{isCameraReady ? 'READY_BOOTH' : 'STREAMING...'}</span>
              </div>
            </div>
          )}

          {/* Galeri Preview Sementara dari Foto yang Sudah Terjepret */}
          {photos.length > 0 && (
            <div className="w-full flex flex-col gap-3 mt-2 animate-scale-up">
              <h4 className="text-xs font-mono text-gray-400 uppercase">Jepretan Terkumpul:</h4>
              <div className="grid grid-cols-3 gap-3">
                {photos.map((src, index) => (
                  <div key={index} className="relative aspect-video rounded-xl overflow-hidden border border-dark-border bg-dark-card">
                    <img src={src} className="w-full h-full object-cover" alt={`Shot ${index + 1}`} />
                    <span className="absolute top-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[10px] font-mono text-neon-blue">
                      #{index + 1}
                    </span>
                  </div>
                ))}
                {Array.from({ length: 3 - photos.length }).map((_, i) => (
                  <div key={i} className="aspect-video rounded-xl border border-dashed border-gray-700 flex items-center justify-center text-gray-600 font-mono text-xs">
                    Menunggu...
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------- TAMPILAN PREVIEW ---------------- */}
      {step === 'preview' && (
        <div className="w-full flex flex-col lg:flex-row items-center lg:items-stretch gap-8 animate-scale-up">
          
          {/* Sisi Kiri: Canvas Pratinjau Strip Film */}
          <div className="flex-1 flex justify-center items-center">
            <div className="p-3 rounded-3xl border border-dark-border bg-dark-card shadow-2xl max-w-sm w-full">
              <canvas
                ref={resultCanvasRef}
                className="w-full h-auto object-contain rounded-2xl shadow-md max-h-[75vh]"
              />
            </div>
          </div>

          {/* Sisi Kanan: Panel Unduh & Retake */}
          <div className="w-full lg:w-80 flex flex-col justify-between gap-6 glass-panel p-6 rounded-3xl border border-dark-border">
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-xl font-bold text-white">Hasil Sesi Foto</h3>
                <p className="text-xs text-gray-400 mt-1">3 jepretan Anda berhasil digabungkan dalam satu lembar strip film.</p>
              </div>

              <div className="bg-dark-bg/60 p-4 rounded-2xl border border-dark-border/50 text-[11px] text-gray-400 space-y-2.5">
                <div className="flex items-center justify-between text-white font-semibold">
                  <span>Status Gabungan</span>
                  <span className="text-neon-blue">Sukses</span>
                </div>
                <hr className="border-dark-border" />
                <p>Bingkai eksternal digambar dari <code>{FRAME_IMAGE_PATH}</code>. Jika tidak ada, sistem menggambar fallback strip film hitam.</p>
                <p className="text-[10px] text-neon-purple-glow">Tip: Buka file komponen untuk mengubah koordinat foto agar sesuai dengan cetakan bingkai Anda.</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleDownload}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple text-white font-extrabold text-sm shadow-lg hover:shadow-cyan-500/10 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Unduh Strip (PNG)
              </button>

              <button
                onClick={handleRetake}
                className="w-full py-3 rounded-xl bg-dark-bg border border-dark-border text-gray-300 hover:text-white hover:bg-gray-800/40 font-bold text-sm transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Ambil Ulang Sesi
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

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
const CANVAS_HEIGHT = 2700;  // Tinggi total kanvas hasil akhir (dalam piksel)

const PHOTO_WIDTH = 1000;    // Lebar masing-masing dari ke-3 foto pada kanvas
const PHOTO_HEIGHT = 750;    // Tinggi masing-masing dari ke-3 foto pada kanvas (Aspek Rasio 4:3)
const PHOTO_X = 100;         // Posisi X (horizontal) foto (tengah secara horizontal: (1200 - 1000) / 2)

// Posisi Y (vertikal) untuk masing-masing foto (Jepretan 1, 2, dan 3)
const PHOTO_Y_COORDS = [
  120,   // Jepretan 1 (Foto paling atas)
  930,   // Jepretan 2 (Foto di tengah)
  1740   // Jepretan 3 (Foto paling bawah)
];

// Warna Latar Belakang Kanvas (Background Layer dasar di bawah foto)
const CANVAS_BG_COLOR = "#ffffff"; 

// Path Gambar Bingkai Eksternal Anda (Mendukung Subdirektori GitHub Pages)
const FRAME_IMAGE_PATH = import.meta.env.BASE_URL + "assets/frame.png";

/**
 * =========================================================================
 * KONFIGURASI TEMA BINGKAI PASTELES GIRLY
 * =========================================================================
 */
const FRAMES_CONFIG = {
  sakura: {
    id: 'sakura',
    name: 'Sweet Sakura',
    desc: 'Blush pink ceria',
    color: '#FFECEF',
    textColor: '#E07A8A',
    borderColor: '#FFF5F6',
    stamp: 'Sweet Sakura 🌸',
  },
  lavender: {
    id: 'lavender',
    name: 'Lavender Mist',
    desc: 'Lilac ungu mimpi',
    color: '#F0E6FF',
    textColor: '#8C70C8',
    borderColor: '#FAF5FF',
    stamp: 'Lavender Dream ✦',
  },
  sky: {
    id: 'sky',
    name: 'Sky Breeze',
    desc: 'Baby blue segar',
    color: '#E6F5FF',
    textColor: '#5B8FB9',
    borderColor: '#F0F9FF',
    stamp: 'Sky Breeze ☁',
  },
  peach: {
    id: 'peach',
    name: 'Peach Blossom',
    desc: 'Peach manis hangat',
    color: '#FFF2E6',
    textColor: '#D97A53',
    borderColor: '#FFFBF7',
    stamp: 'Peach Sweet 🍑',
  }
};

/**
 * =========================================================================
 * KONFIGURASI EFEK FILTER KAMERA (WEBCAMTOY STYLE)
 * =========================================================================
 */
const FILTERS = [
  { id: 'normal', name: 'Normal', filterStyle: '', canvasFilter: 'none' },
  { id: 'mono', name: 'B&W Vintage', filterStyle: 'grayscale contrast-[115%] brightness-[95%]', canvasFilter: 'grayscale(100%) contrast(115%) brightness(95%)' },
  { id: 'vintage', name: 'Warm Sepia', filterStyle: 'sepia saturate-[110%] contrast-[95%] brightness-[95%]', canvasFilter: 'sepia(100%) saturate(110%) contrast(95%) brightness(95%)' },
  { id: 'sweet', name: 'Sweet Blush', filterStyle: 'saturate-[125%] brightness-[105%] contrast-[95%] sepia-[0.12] hue-rotate-[-10deg]', canvasFilter: 'saturate(1.25) brightness(1.05) contrast(0.95) sepia(0.12) hue-rotate(-10deg)' },
  { id: 'chrome', name: 'High Chrome', filterStyle: 'contrast-[130%] brightness-[95%] saturate-[110%]', canvasFilter: 'contrast(1.3) brightness(0.95) saturate(1.1)' },
  { id: 'noir', name: 'Noir Classic', filterStyle: 'grayscale contrast-[170%] brightness-[90%]', canvasFilter: 'grayscale(100%) contrast(170%) brightness(90%)' },
  { id: 'sunset', name: 'Sunset Glow', filterStyle: 'sepia-[0.25] saturate-[140%] brightness-[105%] contrast-[95%] hue-rotate-[-15deg]', canvasFilter: 'sepia(0.25) saturate(1.4) brightness(1.05) contrast(0.95) hue-rotate(-15deg)' },
  { id: 'fuji', name: 'Fuji Green', filterStyle: 'sepia-[0.15] hue-rotate-[80deg] saturate-[130%] contrast-[105%]', canvasFilter: 'sepia(0.15) hue-rotate(80deg) saturate(1.3) contrast(1.05)' },
  { id: 'cyber', name: 'Cyber Neon', filterStyle: 'hue-rotate-[190deg] saturate-[180%] contrast-[120%]', canvasFilter: 'hue-rotate(190deg) saturate(1.8) contrast(1.2)' },
  { id: 'ice', name: 'Ice Breeze', filterStyle: 'hue-rotate-[150deg] saturate-[120%] brightness-[105%]', canvasFilter: 'hue-rotate(150deg) saturate(1.2) brightness(1.05)' },
  { id: 'lavender_f', name: 'Lavender Dream', filterStyle: 'hue-rotate-[45deg] saturate-[125%] brightness-[105%] contrast-[95%] sepia-[10%]', canvasFilter: 'hue-rotate(45deg) saturate(1.25) brightness(1.05) contrast(0.95) sepia(0.1)' },
  { id: 'negative', name: 'Cyber Negative', filterStyle: 'invert', canvasFilter: 'invert(100%)' }
];
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
  const [selectedFrame, setSelectedFrame] = useState('sakura'); // 'sakura' | 'lavender' | 'sky' | 'peach'
  const [selectedFilter, setSelectedFilter] = useState('normal'); // normal | mono | vintage | sweet | chrome
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
        width: { ideal: 1440 },
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

  // 3. Menangkap Frame Tunggal dari Video (Dengan Crop 4:3 & Penerapan Filter Kamera)
  const captureFrame = () => {
    if (!videoRef.current || !tempCanvasRef.current) return null;
    const video = videoRef.current;
    const canvas = tempCanvasRef.current;
    const ctx = canvas.getContext('2d');

    const vWidth = video.videoWidth;
    const vHeight = video.videoHeight;
    
    // Crop center ke rasio 4:3
    const targetRatio = 4 / 3;
    const currentRatio = vWidth / vHeight;
    
    let sWidth, sHeight, sx, sy;
    if (currentRatio > targetRatio) {
      // Widescreen: potong bagian kiri dan kanan
      sHeight = vHeight;
      sWidth = vHeight * targetRatio;
      sx = (vWidth - sWidth) / 2;
      sy = 0;
    } else {
      // Taller: potong bagian atas dan bawah
      sWidth = vWidth;
      sHeight = vWidth / targetRatio;
      sx = 0;
      sy = (vHeight - sHeight) / 2;
    }

    canvas.width = sWidth;
    canvas.height = sHeight;

    // Terapkan Filter Kamera Webcamtoy ke Kanvas
    const filterObj = FILTERS.find(f => f.id === selectedFilter);
    if (filterObj && filterObj.canvasFilter) {
      ctx.filter = filterObj.canvasFilter;
    } else {
      ctx.filter = 'none';
    }

    // Terapkan Efek Mirror (Dibalik secara Horizontal)
    ctx.translate(sWidth, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, sWidth, sHeight);
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
  const drawMergedCanvas = () => {
    const canvas = resultCanvasRef.current;
    if (!canvas || photos.length < 3) return;

    const ctx = canvas.getContext('2d');

    // Menggambar bingkai dinamis terpilih
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    let loadedCount = 0;
    const imgElements = photos.map((src) => {
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        if (loadedCount === 3) {
          drawGirlyFrame(ctx, imgElements, FRAMES_CONFIG[selectedFrame]);
        }
      };
      img.src = src;
      return img;
    });
  };

  // Menggambar bingkai kustom pastel girly secara dinamis pada kanvas
  const drawGirlyFrame = (ctx, images, config) => {
    ctx.save();
    
    // 1. Gambar latar belakang strip warna pastel
    ctx.fillStyle = config.color;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // 2. Gambar foto di slot yang ditentukan
    images.forEach((img, index) => {
      const x = PHOTO_X;
      const y = PHOTO_Y_COORDS[index];
      const w = PHOTO_WIDTH;
      const h = PHOTO_HEIGHT;
      
      // Kartu latar putih tebal di belakang foto (efek border polaroid)
      ctx.fillStyle = config.borderColor || "#ffffff";
      ctx.beginPath();
      ctx.roundRect(x - 12, y - 12, w + 24, h + 24, 12);
      ctx.fill();

      ctx.save();
      // Potong agar ujung foto membulat halus
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 8);
      ctx.clip();

      // Logika Crop Center-Fit (Foto yang diambil sudah 4:3, tapi untuk keamanan crop center tetap dipasang)
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
      ctx.restore();

      // Garis border tipis di keliling foto
      ctx.strokeStyle = "rgba(0,0,0,0.05)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 8);
      ctx.stroke();
    });

    // 3. Menggambar lubang sprocket strip film bernuansa imut
    ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
    if (config.id === 'sakura') ctx.fillStyle = "#FFD1D9";
    if (config.id === 'lavender') ctx.fillStyle = "#DBC7FF";
    if (config.id === 'sky') ctx.fillStyle = "#CCE9FF";
    if (config.id === 'peach') ctx.fillStyle = "#FFE3CC";

    const sprocketWidth = 16;
    const sprocketHeight = 24;
    const sprocketSpacing = 44;

    for (let y = 30; y < CANVAS_HEIGHT - 30; y += sprocketHeight + sprocketSpacing) {
      ctx.beginPath();
      ctx.roundRect(20, y, sprocketWidth, sprocketHeight, 4);
      ctx.fill();

      ctx.beginPath();
      ctx.roundRect(CANVAS_WIDTH - 20 - sprocketWidth, y, sprocketWidth, sprocketHeight, 4);
      ctx.fill();
    }

    // 4. Gambar stempel teks handwritten dan detail tanggal di bawah
    const bottomY = CANVAS_HEIGHT - 80;
    
    ctx.fillStyle = config.textColor;
    ctx.textAlign = 'center';
    
    // Teks handwritten menggunakan font Pacifico atau serif
    ctx.font = "italic 48px 'Cormorant Garamond', serif";
    ctx.fillText(config.stamp, CANVAS_WIDTH / 2, bottomY);

    // Tanggal
    ctx.font = "bold 16px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    const now = new Date();
    const formattedDate = now.toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.');
    const formattedTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    ctx.fillText(`STUDIO LUMIÈRE  •  ${formattedDate}  •  ${formattedTime}`, CANVAS_WIDTH / 2, bottomY + 45);

    ctx.restore();
  };

  // Efek gambar kanvas dipicu ketika langkah pratinjau aktif
  useEffect(() => {
    if (step === 'preview' && photos.length === 3) {
      // Tunggu DOM termuat untuk kanvas, lalu gambar
      setTimeout(drawMergedCanvas, 100);
    }
  }, [step, photos, selectedFrame]);

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
    <div className="w-full h-full min-h-0 flex flex-col justify-center overflow-hidden">
      
      {/* ---------------- TAMPILAN KAMERA ---------------- */}
      {step === 'camera' && (
        <div className="w-full h-full min-h-0 flex flex-col md:flex-row items-stretch gap-4 md:gap-6 overflow-hidden">
          
          {/* SISI KIRI: PRATINJAU KAMERA DENGAN OVERLAY TERINTEGRASI */}
          <div className="flex-1 min-h-0 flex flex-col justify-center items-center relative w-full h-full">
            <div className="relative max-h-full max-w-full aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-900 border-4 border-white shadow-xl shadow-pink-200/20 ring-1 ring-chic-rose/10 flex items-center justify-center">
              
              {/* Flash Overlay Effect */}
              {isFlashActive && (
                <div className="absolute inset-0 z-50 animate-flash" />
              )}

              {/* Izin Loading Kamera */}
              {hasPermission === null && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-chic-gray gap-3 bg-neutral-950/40">
                  <RefreshCw className="w-10 h-10 animate-spin text-chic-rose" />
                  <p className="text-xs font-semibold tracking-wider font-mono text-white">Memuat Kamera WebRTC...</p>
                </div>
              )}

              {/* Kamera Gagal Diakses */}
              {hasPermission === false && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-chic-blush-soft/95 z-20">
                  <AlertCircle className="w-12 h-12 text-chic-rose mb-3 animate-bounce" />
                  <h3 className="text-base font-bold text-chic-dark mb-1">Akses Kamera Dibatalkan</h3>
                  <p className="text-chic-gray max-w-xs text-[10px] leading-relaxed mb-4">{errorMsg}</p>
                  <button 
                    onClick={startCamera}
                    className="px-4 py-2 rounded-full bg-gradient-to-r from-chic-rose to-chic-gold text-white text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all"
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
                  className={`w-full h-full object-cover transform -scale-x-100 transition-all duration-300 ${FILTERS.find(f => f.id === selectedFilter)?.filterStyle || ''}`}
                />
              )}

              {/* Countdown Overlay */}
              {countdown !== null && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/30 backdrop-blur-xs z-30">
                  <div className="text-8xl font-serif italic text-chic-rose text-chic-rose-glow animate-countdown select-none">
                    {countdown}
                  </div>
                </div>
              )}

              {/* Visual Indikator Jepretan & Kamera Aktif */}
              {hasPermission === true && (
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 z-10">
                  <div className="flex justify-between w-full text-[9px] font-mono text-white/80">
                    <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-md">
                      <span className={`w-2 h-2 rounded-full bg-chic-rose ${isCapturing ? 'animate-pulse' : ''}`} />
                      <span>{isCapturing ? 'CAPTURING_SESSION' : 'STUDIO_STANDBY'}</span>
                    </div>
                    <div className="bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-md">3_CONSECUTIVE_POSES</div>
                  </div>

                  {isCapturing && (
                    <div className="self-center bg-white/95 px-4 py-2 rounded-xl border border-chic-border text-center shadow-lg backdrop-blur-md">
                      <p className="text-[8px] text-chic-gray font-mono tracking-widest uppercase">Pose Berjalan</p>
                      <p className="text-xs font-bold text-chic-dark mt-0.5">Jepretan ke-{currentShot} dari 3</p>
                    </div>
                  )}

                  <div className="flex justify-between w-full text-[9px] font-mono text-white/60">
                    <div className="bg-black/30 px-1.5 py-0.5 rounded">FHD 1080P</div>
                    <div className="bg-black/30 px-1.5 py-0.5 rounded">STUDIO: ONLINE</div>
                  </div>
                </div>
              )}

              {/* OVERLAY GALERI PREVIEW JEPRETAN (FLOATING THUMBNAILS) */}
              {hasPermission === true && (
                <div className="absolute bottom-3 left-3 right-3 z-20 flex gap-2 justify-center bg-black/40 backdrop-blur-md py-1.5 px-2 rounded-xl border border-white/10">
                  {Array.from({ length: 3 }).map((_, index) => {
                    const photoSrc = photos[index];
                    return (
                      <div key={index} className="relative w-14 h-10 md:w-16 md:h-12 rounded-lg overflow-hidden border border-white/60 bg-white/10 shadow flex-shrink-0 flex items-center justify-center">
                        {photoSrc ? (
                          <img src={photoSrc} className="w-full h-full object-cover" alt={`Pose ${index + 1}`} />
                        ) : (
                          <span className="text-[8px] text-white/50 font-mono">Pose {index + 1}</span>
                        )}
                        {photoSrc && (
                          <span className="absolute bottom-0.5 right-0.5 bg-chic-rose text-white text-[7px] px-1 rounded-sm font-bold font-mono">
                            #{index + 1}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          </div>

          {/* Canvas Penyimpan Sementara */}
          <canvas ref={tempCanvasRef} className="hidden" />

          {/* SISI KANAN: PANEL OPSI & KONTROL (SIDEBAR) */}
          <div className="w-full md:w-[320px] flex flex-col justify-center gap-3 min-h-0 overflow-y-auto no-scrollbar">
            
            {/* TATA LETAK PILIHAN BINGKAI (FRAME SELECTOR) */}
            <div className="w-full flex flex-col gap-2 bg-white/70 backdrop-blur-md p-3.5 rounded-2xl border border-chic-border/40 shadow-xs">
              <div className="flex flex-col">
                <h3 className="text-xs font-bold text-chic-dark tracking-wide uppercase">Pilih Bingkai</h3>
                <p className="text-[9px] text-chic-gray">Tentukan warna & tema bingkai studio</p>
              </div>
              
              <div className="flex flex-row gap-2 overflow-x-auto pb-1 w-full no-scrollbar">
                {Object.values(FRAMES_CONFIG).map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFrame(f.id)}
                    className={`relative flex-shrink-0 flex flex-row items-center gap-2 p-2 rounded-xl border transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
                      selectedFrame === f.id
                        ? 'border-chic-rose bg-white shadow-sm ring-1 ring-chic-rose/10'
                        : 'border-chic-border/30 bg-white/40 hover:bg-white/80'
                    }`}
                  >
                    {/* Miniature strip mockup */}
                    <div className="w-6 h-8 rounded-sm border border-chic-border/60 flex flex-col justify-around p-0.5" style={{ backgroundColor: f.color || '#ffffff' }}>
                      <div className="w-full h-1 bg-chic-gray/10 rounded-2xs" />
                      <div className="w-full h-1 bg-chic-gray/10 rounded-2xs" />
                      <div className="w-full h-1 bg-chic-gray/10 rounded-2xs" />
                    </div>
                    
                    <div className="flex flex-col items-start pr-1">
                      <span className="text-[10px] font-bold text-chic-dark leading-tight">{f.name}</span>
                      <span className="text-[8px] text-chic-gray leading-none mt-0.5">{f.desc}</span>
                    </div>
                    
                    {selectedFrame === f.id && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-chic-rose text-white text-[7px] font-bold shadow-xs">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* TATA LETAK PILIHAN FILTER KAMERA (FILTER SELECTOR) */}
            <div className="w-full flex flex-col gap-2 bg-white/70 backdrop-blur-md p-3.5 rounded-2xl border border-chic-border/40 shadow-xs">
              <div className="flex flex-col">
                <h3 className="text-xs font-bold text-chic-dark tracking-wide uppercase">Pilih Efek Kamera</h3>
                <p className="text-[9px] text-chic-gray">Terapkan filter estetik ke kamera</p>
              </div>
              
              <div className="flex flex-row gap-2 overflow-x-auto pb-1 w-full no-scrollbar">
                {FILTERS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFilter(f.id)}
                    className={`flex-shrink-0 py-1.5 px-3 rounded-lg border text-center transition-all duration-200 hover:-translate-y-0.5 active:scale-95 text-[10px] ${
                      selectedFilter === f.id
                        ? 'border-chic-rose bg-white shadow-sm text-chic-rose font-bold'
                        : 'border-chic-border/30 bg-white/40 hover:bg-white/80 text-chic-dark font-medium'
                    }`}
                  >
                    <span>{f.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Panel Kontrol Pengambilan Foto */}
            {hasPermission === true && (
              <div className="w-full flex flex-col gap-3 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-chic-border/40 shadow-sm">
                
                {/* Pemilih Kamera */}
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] font-mono text-chic-gray tracking-wide">INPUT DEVICE:</span>
                  {devices.length > 1 ? (
                    <select
                      value={selectedDeviceId}
                      onChange={(e) => setSelectedDeviceId(e.target.value)}
                      className="w-full bg-white text-chic-dark border border-chic-border rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-chic-rose/30 focus:border-chic-rose shadow-sm"
                    >
                      {devices.map((device, idx) => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.label || `Camera ${idx + 1}`}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-[10px] font-bold text-chic-dark bg-white border border-chic-border px-2.5 py-1 rounded-lg shadow-sm block truncate">
                      {devices[0]?.label || "Kamera Utama"}
                    </span>
                  )}
                </div>

                {/* Tombol Mulai Ambil 3 Foto */}
                <button
                  onClick={startCaptureSession}
                  disabled={!isCameraReady || isCapturing}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-chic-rose to-chic-gold text-white font-bold text-xs shadow-md hover:scale-[1.01] active:scale-99 disabled:opacity-50 disabled:scale-100 transition-all w-full"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Mulai Pose (3x Foto)
                </button>

                {/* Status Mini */}
                <div className="flex items-center justify-between text-[9px] font-mono text-chic-gray">
                  <div className="flex items-center gap-1.5">
                    <Zap className={`w-3.5 h-3.5 ${isCameraReady ? 'text-chic-rose' : 'text-chic-gray/50'}`} />
                    <span>{isCameraReady ? 'BOOTH_READY' : 'STREAMING...'}</span>
                  </div>
                  <span>3_SHOTS</span>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ---------------- TAMPILAN PREVIEW ---------------- */}
      {step === 'preview' && (
        <div className="w-full h-full min-h-0 flex flex-col md:flex-row items-stretch justify-center gap-6 overflow-hidden animate-scale-up">
          
          {/* Sisi Kiri: Canvas Pratinjau Strip Film */}
          <div className="flex-1 min-h-0 flex justify-center items-center">
            <div className="p-3 rounded-2xl border border-chic-border/40 bg-white shadow-lg h-full max-h-[55vh] md:max-h-[65vh] aspect-[12/27] flex items-center justify-center">
              <canvas
                ref={resultCanvasRef}
                className="max-h-full max-w-full object-contain rounded-xl shadow-sm"
              />
            </div>
          </div>

          {/* Sisi Kanan: Panel Unduh & Retake */}
          <div className="w-full md:w-[300px] flex flex-col justify-between gap-4 glass-panel-glow p-5 rounded-2xl border border-chic-border/40 shadow-md">
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-base font-bold text-chic-dark">Hasil Sesi Foto</h3>
                <p className="text-[10px] text-chic-gray mt-0.5 leading-relaxed">3 jepretan Anda berhasil digabungkan dalam satu lembar strip film premium.</p>
              </div>

              <div className="bg-[#FFF9F9] p-3.5 rounded-xl border border-chic-border/40 text-[10px] text-chic-gray space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between text-chic-dark font-bold">
                  <span>Status Gabungan</span>
                  <span className="text-chic-rose">Sukses</span>
                </div>
                <hr className="border-chic-border/40" />
                <p className="leading-relaxed">Bingkai studio dimuat dari berkas digital Anda. format resolusi tinggi PNG.</p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleDownload}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-chic-rose to-chic-gold text-white font-bold text-xs shadow-md hover:scale-[1.01] active:scale-99 transition-all flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Unduh Strip (PNG)
              </button>

              <button
                onClick={handleRetake}
                className="w-full py-2.5 rounded-xl bg-white border border-chic-border text-chic-rose hover:bg-[#FFF0F2] font-semibold text-xs shadow-sm active:scale-99 transition-all flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Ambil Ulang Sesi
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

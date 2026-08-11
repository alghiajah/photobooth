import React, { useState, useEffect, useRef } from 'react';
import { Camera, AlertCircle, RefreshCw, Download, RotateCcw, Zap, Play, Cloud, Check, ExternalLink } from 'lucide-react';
import { uploadPhotoToGoogleDrive } from '../services/gdriveService';

/**
 * =========================================================================
 * KONFIGURASI KOORDINAT PENGGABUNGAN FOTO DI CANVAS
 * 
 * Anda dapat mengedit nilai-nilai di bawah ini untuk mencocokkan koordinat 
 * lubang (transparent windows) pada desain bingkai (/assets/frame.png) Anda.
 * =========================================================================
 */
/**
 * =========================================================================
 * KONFIGURASI TATA LETAK GRID FOTO (DYNAMIC GRID CONFIG)
 * =========================================================================
 */
const LAYOUTS_CONFIG = {
  strip_3: {
    id: 'strip_3',
    name: '3 Photos',
    desc: 'Strip Vertikal Klasik',
    photoCount: 3,
    canvasWidth: 1200,
    canvasHeight: 2700,
    getCoords: () => [
      { x: 100, y: 120, w: 1000, h: 750 },
      { x: 100, y: 930, w: 1000, h: 750 },
      { x: 100, y: 1740, w: 1000, h: 750 }
    ],
    textY: 2620,
    type: 'vertical'
  },
  strip_2: {
    id: 'strip_2',
    name: '2 Photos',
    desc: 'Strip Vertikal Ganda',
    photoCount: 2,
    canvasWidth: 1200,
    canvasHeight: 2000,
    getCoords: () => [
      { x: 100, y: 150, w: 1000, h: 750 },
      { x: 100, y: 1000, w: 1000, h: 750 }
    ],
    textY: 1910,
    type: 'vertical'
  },
  strip_4: {
    id: 'strip_4',
    name: '4 Photos',
    desc: 'Strip Vertikal Quad',
    photoCount: 4,
    canvasWidth: 1200,
    canvasHeight: 3400,
    getCoords: () => [
      { x: 100, y: 100, w: 1000, h: 750 },
      { x: 100, y: 910, w: 1000, h: 750 },
      { x: 100, y: 1720, w: 1000, h: 750 },
      { x: 100, y: 2530, w: 1000, h: 750 }
    ],
    textY: 3310,
    type: 'vertical'
  },
  wide_2: {
    id: 'wide_2',
    name: '2 Photos (H)',
    desc: 'Berdampingan Mendatar',
    photoCount: 2,
    canvasWidth: 2200,
    canvasHeight: 1200,
    getCoords: () => [
      { x: 100, y: 150, w: 960, h: 720 },
      { x: 1140, y: 150, w: 960, h: 720 }
    ],
    textY: 1050,
    type: 'horizontal'
  },
  grid_4: {
    id: 'grid_4',
    name: '4 Photos (G)',
    desc: 'Grid Simetris 2x2',
    photoCount: 4,
    canvasWidth: 2200,
    canvasHeight: 1850,
    getCoords: () => [
      { x: 100, y: 120, w: 960, h: 720 },
      { x: 1140, y: 120, w: 960, h: 720 },
      { x: 100, y: 920, w: 960, h: 720 },
      { x: 1140, y: 920, w: 960, h: 720 }
    ],
    textY: 1750,
    type: 'grid'
  },
  grid_9: {
    id: 'grid_9',
    name: '9 Photos',
    desc: 'Mega Grid 3x3',
    photoCount: 9,
    canvasWidth: 2200,
    canvasHeight: 2200,
    getCoords: () => {
      const coords = [];
      const w = 600;
      const h = 450;
      const xStart = 100;
      const yStart = 120;
      const xGap = 80;
      const yGap = 80;
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          coords.push({
            x: xStart + c * (w + xGap),
            y: yStart + r * (h + yGap),
            w,
            h
          });
        }
      }
      return coords;
    },
    textY: 1980,
    type: 'grid'
  }
};

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
  },
  strawberry: {
    id: 'strawberry',
    name: 'Strawberry Milk',
    desc: 'Susu stroberi manis',
    color: '#FFE5EC',
    textColor: '#FF5D8F',
    borderColor: '#FFF0F3',
    stamp: 'Strawberry Milk 🍓✨',
  },
  barbie: {
    id: 'barbie',
    name: 'Barbie Glam',
    desc: 'Bubblegum princess',
    color: '#FFC2D1',
    textColor: '#FF0A54',
    borderColor: '#FFE5EC',
    stamp: 'Barbie World 🎀💅',
  },
  cotton: {
    id: 'cotton',
    name: 'Candy Rainbow',
    desc: 'Gradasi pelangi impian',
    color: '#F0E6FF',
    gradient: [
      { offset: 0, color: '#F0E6FF' },
      { offset: 0.5, color: '#FFE5EC' },
      { offset: 1, color: '#E6F5FF' }
    ],
    textColor: '#8C70C8',
    borderColor: '#FFFFFF',
    stamp: 'Cotton Candy Dream 🦄🍭',
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

/**
 * =========================================================================
 * KONFIGURASI OVERLAY COMPANION (FOTO BARENG INTAN JKT48)
 * =========================================================================
 */
const INTAN_POSES = [
  {
    id: 'none',
    name: 'Solo Mode',
    desc: 'Foto Sendiri',
    icon: '👤',
    src: null
  },
  {
    id: 'intan_1',
    name: 'Pose 1',
    desc: 'Senyum Ceria 🌸',
    icon: '✨',
    src: import.meta.env.BASE_URL + 'assets/intan-1.png'
  },
  {
    id: 'intan_2',
    name: 'Pose 2',
    desc: 'Gemas Dagu 💖',
    icon: '🎀',
    src: import.meta.env.BASE_URL + 'assets/intan-2.png'
  },
  {
    id: 'intan_3',
    name: 'Pose 3',
    desc: 'Imut Pose 🍭',
    icon: '⭐',
    src: import.meta.env.BASE_URL + 'assets/intan-3.png'
  }
];

export default function PhotoBooth({ currentUser }) {
  const videoRef = useRef(null);
  const tempCanvasRef = useRef(null);
  const resultCanvasRef = useRef(null);
  const streamRef = useRef(null);

  // State Manajemen Kamera & Siklus
  const [step, setStep] = useState('camera'); // 'camera' | 'preview'
  const [selectedFrame, setSelectedFrame] = useState('sakura'); // 'sakura' | 'lavender' | 'sky' | 'peach'
  const [selectedLayout, setSelectedLayout] = useState('strip_3'); // strip_3 | strip_2 | strip_4 | wide_2 | grid_4 | grid_9
  // State & Ref untuk Overlay Intan Draggable & Resizable
  const [intanScale, setIntanScale] = useState(1.0); // 0.4 - 2.0
  const [intanPosPercent, setIntanPosPercent] = useState({ x: 55, y: 15 }); // % dari left & top container kamera
  const [isDraggingIntan, setIsDraggingIntan] = useState(false);

  const cameraContainerRef = useRef(null);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, posX: 55, posY: 15 });
  const intanImagesRef = useRef({});

  // Reset Posisi & Ukuran Intan
  const resetIntanTransform = () => {
    setIntanScale(1.0);
    if (intanPosition === 'right') {
      setIntanPosPercent({ x: 55, y: 15 });
    } else {
      setIntanPosPercent({ x: 5, y: 15 });
    }
  };

  const handlePositionToggle = (pos) => {
    setIntanPosition(pos);
    if (pos === 'right') {
      setIntanPosPercent({ x: 55, y: 15 });
    } else {
      setIntanPosPercent({ x: 5, y: 15 });
    }
  };

  // Handler Drag Intan (Mouse & Touch)
  const handleIntanDragStart = (e) => {
    e.preventDefault();
    setIsDraggingIntan(true);

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    dragStartRef.current = {
      mouseX: clientX,
      mouseY: clientY,
      posX: intanPosPercent.x,
      posY: intanPosPercent.y
    };
  };

  useEffect(() => {
    const handleDragMove = (e) => {
      if (!isDraggingIntan || !cameraContainerRef.current) return;

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const rect = cameraContainerRef.current.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const deltaX = clientX - dragStartRef.current.mouseX;
      const deltaY = clientY - dragStartRef.current.mouseY;

      const deltaXPercent = (deltaX / rect.width) * 100;
      const deltaYPercent = (deltaY / rect.height) * 100;

      let newX = dragStartRef.current.posX + deltaXPercent;
      let newY = dragStartRef.current.posY + deltaYPercent;

      newX = Math.max(-25, Math.min(85, newX));
      newY = Math.max(-20, Math.min(85, newY));

      setIntanPosPercent({ x: newX, y: newY });
    };

    const handleDragEnd = () => {
      if (isDraggingIntan) {
        setIsDraggingIntan(false);
      }
    };

    if (isDraggingIntan) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDragMove, { passive: false });
      window.addEventListener('touchend', handleDragEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDraggingIntan]);

  // Handler Scroll Zoom / Resizing
  const handleIntanWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 0.05 : -0.05;
    setIntanScale(prev => Math.max(0.4, Math.min(2.0, parseFloat((prev + zoomFactor).toFixed(2)))));
  };

  // Preload & Auto Chroma-Key Removal untuk Foto Intan (100% Transparan)
  useEffect(() => {
    INTAN_POSES.forEach(pose => {
      if (pose.src) {
        const rawImg = new Image();
        rawImg.crossOrigin = 'anonymous';
        rawImg.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = rawImg.naturalWidth || rawImg.width;
          canvas.height = rawImg.naturalHeight || rawImg.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(rawImg, 0, 0);

          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            const maxRB = Math.max(r, b);
            if (g > 65 && g > maxRB * 1.1) {
              const greenExcess = g - maxRB;
              if (greenExcess > 25) {
                data[i + 3] = 0; // Transparan total 100%
              } else {
                data[i + 3] = Math.max(0, 255 - greenExcess * 10);
                data[i + 1] = maxRB; // Despill hijau di pinggiran
              }
            }
          }

          ctx.putImageData(imgData, 0, 0);

          const cleanImg = new Image();
          cleanImg.src = canvas.toDataURL('image/png');
          cleanImg.onload = () => {
            intanImagesRef.current[pose.id] = cleanImg;
          };
        };
        rawImg.src = pose.src;
      }
    });
  }, []);

  const [hasPermission, setHasPermission] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [isCameraReady, setIsCameraReady] = useState(false);

  // State Pengambilan Foto Beruntun (Dynamic Loop)
  const [photos, setPhotos] = useState([]); // Menampung base64 foto-foto hasil jepretan
  const [isCapturing, setIsCapturing] = useState(false);
  const [currentShot, setCurrentShot] = useState(0); // 1, 2, 3, dst.
  const [countdown, setCountdown] = useState(null); // 3, 2, 1, null
  const [isFlashActive, setIsFlashActive] = useState(false);

  // Helfer fungsi jeda (sleep) menggunakan Promise
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // State Integrasi Google Drive
  const [gdriveStatus, setGdriveStatus] = useState('idle'); // 'idle' | 'uploading' | 'success' | 'error'
  const [gdriveUrl, setGdriveUrl] = useState('');
  const [gdriveError, setGdriveError] = useState('');
  const uploadTimeoutRef = useRef(null);

  // Bersihkan timer saat unmount
  useEffect(() => {
    return () => {
      if (uploadTimeoutRef.current) {
        clearTimeout(uploadTimeoutRef.current);
      }
    };
  }, []);

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

    // Tempelkan Overlay Cutout Intan jika aktif (dengan filter & posisi/skala terpilih)
    if (selectedIntanPose !== 'none') {
      const intanImg = intanImagesRef.current[selectedIntanPose];
      if (intanImg && intanImg.complete && intanImg.naturalWidth !== 0) {
        const iHeight = sHeight * 0.85 * intanScale;
        const iWidth = (intanImg.width / intanImg.height) * iHeight;

        // Konversi intanPosPercent dari live preview ke titik koordinat kanvas
        const ix = (intanPosPercent.x / 100) * sWidth;
        const iy = (intanPosPercent.y / 100) * sHeight;

        ctx.save();
        if (intanPosition === 'left') {
          ctx.translate(ix + iWidth, iy);
          ctx.scale(-1, 1);
          ctx.drawImage(intanImg, 0, 0, iWidth, iHeight);
        } else {
          ctx.drawImage(intanImg, ix, iy, iWidth, iHeight);
        }
        ctx.restore();
      }
    }

    ctx.filter = 'none';

    return canvas.toDataURL('image/jpeg', 0.95);
  };

  // 4. Siklus Pengambilan Foto Beruntun (Dynamic Grid Loop)
  const startCaptureSession = async () => {
    if (!isCameraReady || isCapturing) return;

    const layout = LAYOUTS_CONFIG[selectedLayout];
    setIsCapturing(true);
    setPhotos([]);
    
    // Perulangan mengambil foto sesuai jumlah grid
    for (let shot = 1; shot <= layout.photoCount; shot++) {
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
      if (shot < layout.photoCount) {
        await sleep(1500);
      }
    }

    setIsCapturing(false);
    setStep('preview');
  };

  // 5. Menggambar Gabungan (Canvas Merging) setelah Foto Diambil
  const drawMergedCanvas = () => {
    const canvas = resultCanvasRef.current;
    const layout = LAYOUTS_CONFIG[selectedLayout];
    if (!canvas || photos.length < layout.photoCount) return;

    const ctx = canvas.getContext('2d');

    // Menggambar bingkai dinamis terpilih
    canvas.width = layout.canvasWidth;
    canvas.height = layout.canvasHeight;

    let loadedCount = 0;
    const imgElements = photos.map((src) => {
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        if (loadedCount === layout.photoCount) {
          drawGirlyFrame(ctx, imgElements, FRAMES_CONFIG[selectedFrame], layout);

          // Jadwalkan upload otomatis ke Google Drive (Debounce 2.5 detik)
          if (uploadTimeoutRef.current) {
            clearTimeout(uploadTimeoutRef.current);
          }
          setGdriveStatus('idle'); // Kembalikan ke idle saat render ulang
          uploadTimeoutRef.current = setTimeout(() => {
            triggerGoogleDriveUpload();
          }, 2500);
        }
      };
      img.src = src;
      return img;
    });
  };

  // Menggambar bingkai kustom pastel girly secara dinamis pada kanvas
  const drawGirlyFrame = (ctx, images, config, layout) => {
    ctx.save();
    
    // 1. Gambar latar belakang strip warna pastel (solid atau gradasi)
    if (config.gradient) {
      const grad = ctx.createLinearGradient(0, 0, layout.canvasWidth, layout.canvasHeight);
      config.gradient.forEach(stop => grad.addColorStop(stop.offset, stop.color));
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = config.color;
    }
    ctx.fillRect(0, 0, layout.canvasWidth, layout.canvasHeight);
    
    const coords = layout.getCoords();

    // 2. Gambar foto di slot yang ditentukan
    images.forEach((img, index) => {
      const coord = coords[index] || { x: 100, y: 100, w: 1000, h: 750 };
      const { x, y, w, h } = coord;
      
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

    // 3. Menggambar elemen hiasan (sprocket film untuk vertical, atau ornamen bintang/hati untuk grid/horizontal)
    if (layout.type === 'vertical') {
      ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
      if (config.id === 'sakura') ctx.fillStyle = "#FFD1D9";
      if (config.id === 'lavender') ctx.fillStyle = "#DBC7FF";
      if (config.id === 'sky') ctx.fillStyle = "#CCE9FF";
      if (config.id === 'peach') ctx.fillStyle = "#FFE3CC";

      const sprocketWidth = 16;
      const sprocketHeight = 24;
      const sprocketSpacing = 44;

      for (let y = 30; y < layout.canvasHeight - 30; y += sprocketHeight + sprocketSpacing) {
        ctx.beginPath();
        ctx.roundRect(20, y, sprocketWidth, sprocketHeight, 4);
        ctx.fill();

        ctx.beginPath();
        ctx.roundRect(layout.canvasWidth - 20 - sprocketWidth, y, sprocketWidth, sprocketHeight, 4);
        ctx.fill();
      }
    } else {
      // Ornamen dekorasi hati & bintang imut untuk layout grid/horizontal
      ctx.fillStyle = config.textColor;
      
      const drawMiniHeart = (hx, hy, size) => {
        ctx.beginPath();
        ctx.moveTo(hx, hy + size / 4);
        ctx.quadraticCurveTo(hx, hy, hx - size / 2, hy);
        ctx.quadraticCurveTo(hx - size, hy, hx - size, hy + size / 2);
        ctx.quadraticCurveTo(hx - size, hy + size, hx, hy + size * 1.5);
        ctx.quadraticCurveTo(hx + size, hy + size, hx + size, hy + size / 2);
        ctx.quadraticCurveTo(hx + size, hy, hx + size / 2, hy);
        ctx.quadraticCurveTo(hx, hy, hx, hy + size / 4);
        ctx.fill();
      };

      const drawMiniStar = (cx, cy, spikes, outerRadius, innerRadius) => {
        let rot = Math.PI / 2 * 3;
        let sx = cx;
        let sy = cy;
        let step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius)
        for (let i = 0; i < spikes; i++) {
          sx = cx + Math.cos(rot) * outerRadius;
          sy = cy + Math.sin(rot) * outerRadius;
          ctx.lineTo(sx, sy)
          rot += step

          sx = cx + Math.cos(rot) * innerRadius;
          sy = cy + Math.sin(rot) * innerRadius;
          ctx.lineTo(sx, sy)
          rot += step
        }
        ctx.lineTo(cx, cy - outerRadius)
        ctx.closePath();
        ctx.fill();
      };

      // Terapkan beberapa dekorasi kecil imut di margin atas
      drawMiniHeart(60, 60, 16);
      drawMiniHeart(layout.canvasWidth - 60, 60, 16);
      drawMiniStar(layout.canvasWidth / 2 - 180, 60, 4, 12, 5);
      drawMiniStar(layout.canvasWidth / 2 + 180, 60, 4, 12, 5);
    }

    // 4. Gambar stempel teks handwritten dan detail tanggal di bawah
    const bottomY = layout.textY;
    
    ctx.fillStyle = config.textColor;
    ctx.textAlign = 'center';
    
    // Teks handwritten menggunakan font Pacifico atau serif
    ctx.font = "italic 48px 'Cormorant Garamond', serif";
    const userStamp = currentUser ? `${config.stamp} • ${currentUser.name} ✦` : config.stamp;
    ctx.fillText(userStamp, layout.canvasWidth / 2, bottomY);

    // Tanggal
    ctx.font = "bold 16px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    const now = new Date();
    const formattedDate = now.toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.');
    const formattedTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    ctx.fillText(`STUDIO LUMIÈRE  •  ${formattedDate}  •  ${formattedTime}`, layout.canvasWidth / 2, bottomY + 45);

    ctx.restore();
  };

  // Efek gambar kanvas dipicu ketika langkah pratinjau aktif
  useEffect(() => {
    const layout = LAYOUTS_CONFIG[selectedLayout];
    if (step === 'preview' && photos.length === layout.photoCount) {
      // Tunggu DOM termuat untuk kanvas, lalu gambar
      setTimeout(drawMergedCanvas, 100);
    }
  }, [step, photos, selectedFrame, selectedLayout]);

  // Fungsi Pemicu Upload Google Drive
  const triggerGoogleDriveUpload = async () => {
    const canvas = resultCanvasRef.current;
    if (!canvas) return;

    if (uploadTimeoutRef.current) {
      clearTimeout(uploadTimeoutRef.current);
    }

    const scriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbzPxvlI93bgmD_myp8KpocyMr4OX5wE6jsBRVbYLoW__rLik9AfukTQ2o0aU1SPF-CVDw/exec";
    if (!scriptUrl) {
      setGdriveStatus('error');
      setGdriveError('Konfigurasi .env belum diisi (VITE_GOOGLE_SCRIPT_URL kosong).');
      return;
    }

    setGdriveStatus('uploading');
    setGdriveError('');

    try {
      const base64Data = canvas.toDataURL('image/png');
      const name = currentUser?.name || 'guest';
      const result = await uploadPhotoToGoogleDrive(base64Data, name);
      if (result.success) {
        setGdriveStatus('success');
        setGdriveUrl(result.fileUrl);
      }
    } catch (err) {
      console.error("Gagal mengunggah otomatis ke Google Drive:", err);
      setGdriveStatus('error');
      setGdriveError(err.message || 'Koneksi API bermasalah');
    }
  };

  // 6. Navigasi Aksi: Unduh & Ambil Ulang
  const handleDownload = () => {
    const canvas = resultCanvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'photobooth-session.png';
    link.href = canvas.toDataURL('image/png');
    link.click();

    // Jika upload belum selesai/gagal, picu upload secara langsung saat diklik unduh
    if (gdriveStatus !== 'success' && gdriveStatus !== 'uploading') {
      triggerGoogleDriveUpload();
    }
  };

  const handleRetake = () => {
    if (uploadTimeoutRef.current) {
      clearTimeout(uploadTimeoutRef.current);
    }
    setPhotos([]);
    setStep('camera');
    setGdriveStatus('idle');
    setGdriveUrl('');
    setGdriveError('');
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col justify-center">
      
      {/* ---------------- TAMPILAN KAMERA ---------------- */}
      {step === 'camera' && (
        <div className="w-full flex flex-col md:flex-row items-start justify-center gap-4 md:gap-6">
          
          {/* SISI KIRI: PRATINJAU KAMERA DENGAN OVERLAY TERINTEGRASI */}
          <div className="flex-1 flex flex-col items-center relative w-full">
            <div ref={cameraContainerRef} className="relative max-h-full max-w-full aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-900 border-4 border-white shadow-xl shadow-pink-200/20 ring-1 ring-chic-rose/10 flex items-center justify-center">
              
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
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover transform -scale-x-100 transition-all duration-300 ${FILTERS.find(f => f.id === selectedFilter)?.filterStyle || ''}`}
                  />

                  {/* Overlay Intan JKT48 Live (Bisa di-drag & diatur ukurannya) */}
                  {selectedIntanPose !== 'none' && (
                    <div 
                      onMouseDown={handleIntanDragStart}
                      onTouchStart={handleIntanDragStart}
                      onWheel={handleIntanWheel}
                      style={{
                        left: `${intanPosPercent.x}%`,
                        top: `${intanPosPercent.y}%`,
                        height: `${85 * intanScale}%`,
                      }}
                      className={`absolute z-25 cursor-grab active:cursor-grabbing select-none group touch-none transition-shadow ${
                        isDraggingIntan ? 'cursor-grabbing border-2 border-dashed border-chic-rose bg-chic-rose/10 rounded-2xl shadow-xl' : 'hover:border-2 hover:border-dashed hover:border-chic-rose/70 hover:rounded-2xl'
                      } ${FILTERS.find(f => f.id === selectedFilter)?.filterStyle || ''}`}
                      title="Klik & Geser untuk memindahkan. Scroll mouse untuk atur ukuran!"
                    >
                      <img 
                        src={intanImagesRef.current[selectedIntanPose]?.src || INTAN_POSES.find(p => p.id === selectedIntanPose)?.src} 
                        alt="Foto Bareng Intan"
                        draggable={false}
                        className={`h-full w-auto object-contain drop-shadow-2xl animate-fade-in pointer-events-none transform transition-transform ${
                          intanPosition === 'left' ? '-scale-x-100' : ''
                        }`}
                      />

                      {/* Tooltip Petunjuk Drag & Scale */}
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 backdrop-blur-xs text-white text-[8px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md pointer-events-none whitespace-nowrap z-30">
                        <span>✋ Geser / Scroll Ukuran ({Math.round(intanScale * 100)}%)</span>
                      </div>
                    </div>
                  )}
                </div>
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
                    <div className="bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-md">
                      {LAYOUTS_CONFIG[selectedLayout].photoCount}_CONSECUTIVE_POSES
                    </div>
                  </div>

                  {isCapturing && (
                    <div className="self-center bg-white/95 px-4 py-2 rounded-xl border border-chic-border text-center shadow-lg backdrop-blur-md">
                      <p className="text-[8px] text-chic-gray font-mono tracking-widest uppercase">Pose Berjalan</p>
                      <p className="text-xs font-bold text-chic-dark mt-0.5">
                        Jepretan ke-{currentShot} dari {LAYOUTS_CONFIG[selectedLayout].photoCount}
                      </p>
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
                <div className="absolute bottom-3 left-3 right-3 z-20 flex flex-wrap gap-1.5 justify-center bg-black/40 backdrop-blur-md py-1.5 px-2 rounded-xl border border-white/10 max-h-[85px] overflow-y-auto no-scrollbar">
                  {Array.from({ length: LAYOUTS_CONFIG[selectedLayout].photoCount }).map((_, index) => {
                    const photoSrc = photos[index];
                    return (
                      <div key={index} className="relative w-12 h-9 md:w-14 md:h-10 rounded-lg overflow-hidden border border-white/40 bg-white/10 shadow-sm flex-shrink-0 flex items-center justify-center">
                        {photoSrc ? (
                          <img src={photoSrc} className="w-full h-full object-cover animate-scale-up" alt={`Pose ${index + 1}`} />
                        ) : (
                          <span className="text-[8px] text-white/50 font-mono">#{index + 1}</span>
                        )}
                        {photoSrc && (
                          <span className="absolute bottom-0.5 right-0.5 bg-chic-rose text-white text-[7px] px-1 rounded-sm font-bold font-mono">
                            ✓
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
          <div className="w-full md:w-[340px] flex flex-col gap-3 flex-shrink-0">
            
            {/* TATA LETAK PILIHAN POSE INTAN JKT48 (COMPANION SELECTOR) */}
            <div className="w-full flex flex-col gap-2.5 bg-gradient-to-r from-pink-500/10 via-rose-500/10 to-purple-500/10 backdrop-blur-md p-3.5 rounded-2xl border border-chic-rose/40 shadow-sm relative">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-bold text-chic-dark tracking-wide uppercase">Foto Bareng Intan</h3>
                    <span className="px-1.5 py-0.5 bg-gradient-to-r from-chic-rose to-chic-gold text-white text-[8px] font-extrabold rounded-full animate-pulse">SPECIAL</span>
                  </div>
                  <p className="text-[9px] text-chic-gray">Pilih pose companion Intan JKT48</p>
                </div>
                
                {/* Toggle Posisi Kiri / Kanan */}
                {selectedIntanPose !== 'none' && (
                  <div className="flex items-center bg-white/90 p-0.5 rounded-lg border border-chic-border text-[9px] font-bold shadow-2xs">
                    <button
                      type="button"
                      onClick={() => handlePositionToggle('left')}
                      className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${intanPosition === 'left' ? 'bg-chic-rose text-white shadow-2xs' : 'text-chic-gray hover:text-chic-dark'}`}
                    >
                      Kiri
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePositionToggle('right')}
                      className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${intanPosition === 'right' ? 'bg-chic-rose text-white shadow-2xs' : 'text-chic-gray hover:text-chic-dark'}`}
                    >
                      Kanan
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-4 gap-2 mt-0.5">
                {INTAN_POSES.map((pose) => {
                  const isSelected = selectedIntanPose === pose.id;
                  const displaySrc = intanImagesRef.current[pose.id]?.src || pose.src;
                  return (
                    <button
                      key={pose.id}
                      type="button"
                      onClick={() => {
                        setSelectedIntanPose(pose.id);
                        if (selectedIntanPose === 'none') {
                          resetIntanTransform();
                        }
                      }}
                      className={`relative flex flex-col items-center justify-between p-1.5 rounded-xl border transition-all duration-200 cursor-pointer hover:-translate-y-0.5 active:scale-95 ${
                        isSelected
                          ? 'border-chic-rose bg-white shadow-md ring-2 ring-chic-rose/30'
                          : 'border-chic-border/40 bg-white/60 hover:bg-white'
                      }`}
                    >
                      <div className="w-full h-11 rounded-lg overflow-hidden bg-rose-50/60 border border-rose-100/60 flex items-center justify-center relative p-0.5">
                        {displaySrc ? (
                          <img src={displaySrc} alt={pose.name} className="h-full w-auto object-contain drop-shadow-xs" />
                        ) : (
                          <span className="text-xl">👤</span>
                        )}
                      </div>
                      <span className="text-[8.5px] font-bold text-chic-dark mt-1 truncate max-w-full text-center leading-none">{pose.name}</span>
                      {isSelected && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-chic-rose text-white text-[8px] font-bold shadow-xs">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Kontrol Pengatur Ukuran Slider & Drag Hint */}
              {selectedIntanPose !== 'none' && (
                <div className="flex flex-col gap-1.5 mt-2 bg-white/80 backdrop-blur-xs p-2.5 rounded-xl border border-chic-border/50 shadow-2xs">
                  <div className="flex items-center justify-between text-[9px] font-bold text-chic-dark">
                    <span>Ukuran Intan:</span>
                    <span className="text-chic-rose font-mono font-extrabold">{Math.round(intanScale * 100)}%</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIntanScale(prev => Math.max(0.4, parseFloat((prev - 0.1).toFixed(2))))}
                      className="w-6 h-6 rounded-lg bg-chic-blush-soft text-chic-dark font-bold text-xs flex items-center justify-center hover:bg-chic-rose hover:text-white transition-colors cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="range"
                      min="0.4"
                      max="2.0"
                      step="0.05"
                      value={intanScale}
                      onChange={(e) => setIntanScale(parseFloat(e.target.value))}
                      className="flex-1 accent-chic-rose h-1.5 bg-chic-border/50 rounded-lg cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => setIntanScale(prev => Math.min(2.0, parseFloat((prev + 0.1).toFixed(2))))}
                      className="w-6 h-6 rounded-lg bg-chic-blush-soft text-chic-dark font-bold text-xs flex items-center justify-center hover:bg-chic-rose hover:text-white transition-colors cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-chic-border/30">
                    <span className="text-[8px] text-chic-gray">💡 Drag di kamera / Scroll mouse</span>
                    <button
                      type="button"
                      onClick={resetIntanTransform}
                      className="text-[8px] font-bold text-chic-rose hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      🔄 Reset Posisi
                    </button>
                  </div>
                </div>
              )}
            </div>
            
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

            {/* TATA LETAK PILIHAN LAYOUT GRID (GRID SELECTOR) */}
            <div className="w-full flex flex-col gap-2 bg-white/70 backdrop-blur-md p-3.5 rounded-2xl border border-chic-border/40 shadow-xs">
              <div className="flex flex-col">
                <h3 className="text-xs font-bold text-chic-dark tracking-wide uppercase">Pilih Layout Grid</h3>
                <p className="text-[9px] text-chic-gray">Format pose dan layout foto studio</p>
              </div>
              
              <div className="grid grid-cols-3 gap-1.5">
                {Object.values(LAYOUTS_CONFIG).map((layout) => {
                  const isSelected = selectedLayout === layout.id;
                  return (
                    <button
                      key={layout.id}
                      onClick={() => {
                        if (!isCapturing) {
                          setSelectedLayout(layout.id);
                          setPhotos([]);
                        }
                      }}
                      disabled={isCapturing}
                      className={`relative flex flex-col items-center justify-between p-1.5 rounded-xl border transition-all duration-200 ${
                        isCapturing ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5 active:scale-95'
                      } ${
                        isSelected
                          ? 'border-chic-rose bg-white shadow-sm ring-1 ring-chic-rose/10'
                          : 'border-chic-border/30 bg-white/40 hover:bg-white/80'
                      }`}
                    >
                      {/* Representasi Visual Grid Mini */}
                      <div className="h-9 w-full flex items-center justify-center mb-1 bg-[#F5E6E8]/30 rounded-lg border border-chic-border/10 p-1">
                        {layout.id === 'strip_3' && (
                          <div className="w-3.5 h-7 bg-neutral-900/10 border border-neutral-600/30 rounded-xs flex flex-col justify-between p-0.5 gap-0.5">
                            <div className="bg-neutral-600/50 flex-1 rounded-3xs" />
                            <div className="bg-neutral-600/50 flex-1 rounded-3xs" />
                            <div className="bg-neutral-600/50 flex-1 rounded-3xs" />
                          </div>
                        )}
                        {layout.id === 'strip_2' && (
                          <div className="w-3.5 h-7 bg-neutral-900/10 border border-neutral-600/30 rounded-xs flex flex-col justify-between p-0.5 gap-0.5">
                            <div className="bg-neutral-600/50 flex-1 rounded-3xs" />
                            <div className="bg-neutral-600/50 flex-1 rounded-3xs" />
                          </div>
                        )}
                        {layout.id === 'strip_4' && (
                          <div className="w-3.5 h-7 bg-neutral-900/10 border border-neutral-600/30 rounded-xs flex flex-col justify-between p-0.5 gap-0.5">
                            <div className="bg-neutral-600/50 flex-1 rounded-3xs" />
                            <div className="bg-neutral-600/50 flex-1 rounded-3xs" />
                            <div className="bg-neutral-600/50 flex-1 rounded-3xs" />
                            <div className="bg-neutral-600/50 flex-1 rounded-3xs" />
                          </div>
                        )}
                        {layout.id === 'wide_2' && (
                          <div className="w-6.5 h-4.5 bg-neutral-900/10 border border-neutral-600/30 rounded-xs flex flex-row justify-between p-0.5 gap-0.5">
                            <div className="bg-neutral-600/50 flex-1 rounded-3xs" />
                            <div className="bg-neutral-600/50 flex-1 rounded-3xs" />
                          </div>
                        )}
                        {layout.id === 'grid_4' && (
                          <div className="w-5.5 h-5.5 bg-neutral-900/10 border border-neutral-600/30 rounded-xs grid grid-cols-2 p-0.5 gap-0.5">
                            <div className="bg-neutral-600/50 rounded-3xs" />
                            <div className="bg-neutral-600/50 rounded-3xs" />
                            <div className="bg-neutral-600/50 rounded-3xs" />
                            <div className="bg-neutral-600/50 rounded-3xs" />
                          </div>
                        )}
                        {layout.id === 'grid_9' && (
                          <div className="w-5.5 h-5.5 bg-neutral-900/10 border border-neutral-600/30 rounded-xs grid grid-cols-3 p-0.5 gap-0.5">
                            <div className="bg-neutral-600/50 rounded-4xs" />
                            <div className="bg-neutral-600/50 rounded-4xs" />
                            <div className="bg-neutral-600/50 rounded-4xs" />
                            <div className="bg-neutral-600/50 rounded-4xs" />
                            <div className="bg-neutral-600/50 rounded-4xs" />
                            <div className="bg-neutral-600/50 rounded-4xs" />
                            <div className="bg-neutral-600/50 rounded-4xs" />
                            <div className="bg-neutral-600/50 rounded-4xs" />
                            <div className="bg-neutral-600/50 rounded-4xs" />
                          </div>
                        )}
                      </div>
                      
                      <span className="text-[7.5px] font-bold text-chic-dark text-center leading-none mt-1">{layout.name}</span>
                      
                      {isSelected && (
                        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-chic-rose text-white text-[7px] font-bold shadow-xs animate-scale-up">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
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

                {/* Tombol Mulai Ambil Foto */}
                <button
                  onClick={startCaptureSession}
                  disabled={!isCameraReady || isCapturing}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-chic-rose to-chic-gold text-white font-bold text-xs shadow-md hover:scale-[1.01] active:scale-99 disabled:opacity-50 disabled:scale-100 transition-all w-full"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Mulai Pose ({LAYOUTS_CONFIG[selectedLayout].photoCount}x Foto)
                </button>

                {/* Status Mini */}
                <div className="flex items-center justify-between text-[9px] font-mono text-chic-gray">
                  <div className="flex items-center gap-1.5">
                    <Zap className={`w-3.5 h-3.5 ${isCameraReady ? 'text-chic-rose' : 'text-chic-gray/50'}`} />
                    <span>{isCameraReady ? 'BOOTH_READY' : 'STREAMING...'}</span>
                  </div>
                  <span>{LAYOUTS_CONFIG[selectedLayout].photoCount}_SHOTS</span>
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
            <div 
              className="p-3 rounded-2xl border border-chic-border/40 bg-white shadow-lg h-full max-h-[55vh] md:max-h-[65vh] flex items-center justify-center"
              style={{ aspectRatio: `${LAYOUTS_CONFIG[selectedLayout].canvasWidth} / ${LAYOUTS_CONFIG[selectedLayout].canvasHeight}` }}
            >
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
                <p className="text-[10px] text-chic-gray mt-0.5 leading-relaxed">
                  {LAYOUTS_CONFIG[selectedLayout].photoCount} jepretan Anda berhasil digabungkan dalam satu lembar cetakan premium.
                </p>
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

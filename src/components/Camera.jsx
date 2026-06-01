import React, { useState, useEffect, useRef } from 'react';
import { Camera as CameraIcon, AlertCircle, RefreshCw, Zap } from 'lucide-react';

/**
 * Komponen Camera
 * Mengelola izin WebRTC, streaming video, efek cermin, hitung mundur, efek flash,
 * serta pengambilan gambar resolusi tinggi menggunakan canvas.
 */
export default function Camera({ onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  
  const [hasPermission, setHasPermission] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [countdown, setCountdown] = useState(null);
  const [isFlashActive, setIsFlashActive] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);

  // 1. Mengakses Daftar Perangkat Input Video (Kamera)
  const getCameras = async () => {
    try {
      const devicesInfo = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devicesInfo.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices);
      
      // Pilih kamera default jika belum dipilih
      if (videoDevices.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
    } catch (err) {
      console.error("Gagal mendeteksi perangkat kamera:", err);
    }
  };

  // 2. Mengaktifkan Stream Kamera Berdasarkan Device ID yang Dipilih
  const startCamera = async () => {
    setIsCameraReady(false);
    
    // Hentikan stream yang sedang berjalan terlebih dahulu
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    const constraints = {
      video: {
        deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
        width: { ideal: 1920 }, // Minta resolusi tinggi (Full HD)
        height: { ideal: 1080 },
        aspectRatio: { ideal: 1.7777777778 } // 16:9
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
      
      // Ambil daftar kamera jika belum diisi
      if (devices.length === 0) {
        await getCameras();
      }
    } catch (err) {
      console.error("Kesalahan akses kamera WebRTC:", err);
      setHasPermission(false);
      
      // Penanganan pesan kesalahan yang ramah pengguna
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMsg("Izin kamera ditolak. Silakan izinkan browser mengakses kamera Anda melalui pengaturan alamat bar atau pengaturan privasi sistem.");
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMsg("Kamera tidak ditemukan di perangkat Anda. Pastikan kamera terpasang dengan benar.");
      } else {
        setErrorMsg(`Gagal mengakses kamera: ${err.message}. Harap pastikan kamera tidak sedang digunakan oleh aplikasi lain.`);
      }
    }
  };

  // Mulai kamera saat pertama kali di-mount atau ketika deviceId diubah
  useEffect(() => {
    startCamera();
    
    return () => {
      // Hentikan kamera saat unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [selectedDeviceId]);

  // 3. Logika Hitung Mundur & Flash
  const triggerCapture = () => {
    if (!isCameraReady || countdown !== null) return;
    
    let count = 3;
    setCountdown(count);

    const timer = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(timer);
        setCountdown(null);
        // Efek Flash & Capture
        setIsFlashActive(true);
        capturePhoto();
        
        // Sembunyikan efek flash setelah 500ms
        setTimeout(() => {
          setIsFlashActive(false);
        }, 500);
      }
    }, 1000);
  };

  // 4. Pengambilan Foto dari Video Stream ke HTML5 Canvas
  const capturePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Gunakan resolusi asli dari video stream
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    canvas.width = videoWidth;
    canvas.height = videoHeight;

    // Membalik gambar secara horizontal di canvas agar sesuai dengan efek cermin (mirror) kamera
    ctx.translate(videoWidth, 0);
    ctx.scale(-1, 1);

    // Menggambar frame video saat ini ke canvas tersembunyi
    ctx.drawImage(video, 0, 0, videoWidth, videoHeight);

    // Kembalikan orientasi transformasi canvas ke awal
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // Ekspor data canvas sebagai base64 JPEG berkualitas tinggi
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    
    // Kirim gambar ke callback App.jsx
    if (onCapture) {
      onCapture(dataUrl);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto p-4">
      {/* Container Kamera dengan Bingkai Mesin Photo Booth Fisik */}
      <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-dark-border bg-black glass-panel-glow">
        
        {/* Flash Effect Overlay */}
        {isFlashActive && (
          <div className="absolute inset-0 z-50 animate-flash" />
        )}

        {/* 1. Kondisi Izin Kamera Belum Ditentukan */}
        {hasPermission === null && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-4">
            <RefreshCw className="w-12 h-12 animate-spin text-neon-purple" />
            <p className="text-lg font-medium">Meminta akses kamera...</p>
          </div>
        )}

        {/* 2. Kondisi Izin Kamera Ditolak / Error */}
        {hasPermission === false && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-dark-bg/95">
            <AlertCircle className="w-16 h-16 text-red-500 mb-4 animate-bounce" />
            <h3 className="text-xl font-bold text-white mb-2">Kamera Tidak Tersedia</h3>
            <p className="text-gray-400 max-w-md text-sm leading-relaxed mb-6">
              {errorMsg}
            </p>
            <button 
              onClick={startCamera}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-neon-purple to-neon-pink text-white font-semibold shadow-lg shadow-purple-500/20 hover:scale-105 transition-transform"
            >
              Coba Hubungkan Kembali
            </button>
          </div>
        )}

        {/* 3. Streaming Video Real-time (Mirror) */}
        {hasPermission === true && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            // Dibalik secara horizontal agar berfungsi seperti cermin
            className="w-full h-full object-cover transform -scale-x-100"
          />
        )}

        {/* 4. Overlay Countdown Hitung Mundur */}
        {countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/45 backdrop-blur-xs z-30">
            <div className="text-8xl md:text-9xl font-extrabold text-neon-purple-glow text-neon-purple animate-countdown">
              {countdown}
            </div>
          </div>
        )}

        {/* Grid Line Visual Overlay untuk Estetika Kamera Digital */}
        {hasPermission === true && (
          <div className="absolute inset-0 pointer-events-none border border-white/5 flex flex-col justify-between">
            <div className="w-full flex justify-between p-4 text-xs font-mono text-white/40">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span>REC</span>
              </div>
              <div>FHD 1080P</div>
            </div>
            <div className="w-full flex justify-between p-4 text-xs font-mono text-white/40">
              <div>ISO 400</div>
              <div>60 FPS</div>
            </div>
          </div>
        )}
      </div>

      {/* Canvas Tersembunyi Untuk Menyimpan Frame */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Kontrol Kamera & Pilihan Perangkat */}
      {hasPermission === true && (
        <div className="w-full mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-dark-border">
          {/* Pemilih Input Kamera */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-xs font-mono text-gray-400 uppercase">Input:</label>
            {devices.length > 1 ? (
              <select
                value={selectedDeviceId}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
                className="bg-dark-input text-gray-200 border border-dark-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-neon-purple"
              >
                {devices.map((device, index) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${index + 1}`}
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-sm font-semibold text-gray-300">
                {devices[0]?.label || "Kamera Bawaan"}
              </span>
            )}
          </div>

          {/* Tombol Utama Ambil Gambar */}
          <button
            onClick={triggerCapture}
            disabled={!isCameraReady || countdown !== null}
            className="flex items-center justify-center gap-3 px-8 py-3.5 rounded-full bg-gradient-to-r from-neon-purple to-neon-blue text-white font-bold text-lg shadow-lg hover:shadow-cyan-500/20 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all w-full sm:w-auto"
          >
            <CameraIcon className="w-5 h-5 animate-pulse" />
            Ambil Foto
          </button>

          {/* Status Indikator */}
          <div className="flex items-center gap-2 text-xs font-mono text-gray-400 uppercase">
            <Zap className={`w-4 h-4 ${isCameraReady ? 'text-neon-blue' : 'text-gray-600'}`} />
            {isCameraReady ? 'Ready' : 'Connecting'}
          </div>
        </div>
      )}
    </div>
  );
}

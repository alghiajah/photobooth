/**
 * Google Drive Upload Service
 * 
 * Mengirimkan data gambar Base64 ke Google Apps Script Web App untuk diunggah
 * secara otomatis ke folder Google Drive tujuan.
 */

/**
 * Mengunggah gambar Base64 ke Google Drive melalui Google Apps Script.
 * 
 * @param {string} base64Data - Data gambar format Base64 DataURL (misal dari canvas.toDataURL)
 * @param {string} userName - Nama pengguna yang mengambil foto (untuk nama berkas)
 * @returns {Promise<{success: boolean, fileUrl: string, fileName: string}>}
 */
export const uploadPhotoToGoogleDrive = async (base64Data, userName = 'guest') => {
  const scriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL;
  
  if (!scriptUrl) {
    console.warn("VITE_GOOGLE_SCRIPT_URL belum dikonfigurasi di berkas .env");
    throw new Error("Konfigurasi Google Apps Script URL tidak ditemukan. Harap atur VITE_GOOGLE_SCRIPT_URL di berkas .env Anda.");
  }

  try {
    const payload = {
      image: base64Data,
      userName: userName
    };

    // Menggunakan 'text/plain' untuk meminimalkan preflight CORS issue pada Google Apps Script
    const response = await fetch(scriptUrl, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'text/plain'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Koneksi ke server gagal (HTTP ${response.status})`);
    }

    const result = await response.json();
    
    if (result && result.status === 'success') {
      return {
        success: true,
        fileUrl: result.fileUrl,
        fileName: result.fileName
      };
    } else {
      throw new Error(result.message || "Server Google Apps Script mengembalikan status gagal.");
    }
  } catch (error) {
    console.error("Gdrive upload service error:", error);
    throw error;
  }
};

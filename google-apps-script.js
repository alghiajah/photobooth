/**
 * Google Apps Script Web App - Lumière Booth Auto-uploader
 * 
 * Petunjuk Penggunaan:
 * 1. Buka https://script.google.com/
 * 2. Buat proyek baru dan salin kode ini ke dalamnya.
 * 3. Simpan dan beri nama proyek.
 * 4. Klik "Deploy" -> "New deployment".
 * 5. Pilih tipe "Web app".
 * 6. Set "Execute as" ke "Me (email Anda)".
 * 7. Set "Who has access" ke "Anyone".
 * 8. Klik "Deploy", berikan izin akses jika diminta (Grant Access), lalu salin URL Web App.
 * 9. Tempel URL Web App tersebut ke berkas `.env` Anda sebagai `VITE_GOOGLE_SCRIPT_URL`.
 */

function doPost(e) {
  // Tambahkan header CORS untuk menghindari masalah CORS di browser
  var corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };

  try {
    var data = JSON.parse(e.postData.contents);
    
    // ID Folder Google Drive target
    var folderId = "11LNpLCiz6YRgO0ep1myfzhvF7aWX6Fxv";
    var folder = DriveApp.getFolderById(folderId);

    // Bersihkan header format Base64 jika ada
    var base64Data = data.image;
    if (base64Data.indexOf(",") > -1) {
      base64Data = base64Data.split(",")[1];
    }
    
    var decoded = Utilities.base64Decode(base64Data);
    
    // Format nama file unik menggunakan nama pengguna dan penanda waktu
    var timestamp = new Date().toISOString().slice(0, 19).replace(/[-:]/g, "");
    var userNameClean = (data.userName || "guest").replace(/[^a-zA-Z0-9]/g, "_");
    var fileName = "lumiere_" + userNameClean + "_" + timestamp + ".png";
    
    var blob = Utilities.newBlob(decoded, 'image/png', fileName);
    var file = folder.createFile(blob);
    
    // Opsional: Buat file dapat dilihat oleh siapa saja yang memiliki link (read-only)
    try {
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (shareErr) {
      // Abaikan jika setSharing gagal karena kebijakan domain GSuite/Google Workspace
      console.warn("Gagal mengubah izin sharing: " + shareErr.toString());
    }

    var response = {
      status: "success",
      message: "Photo uploaded successfully!",
      fileUrl: file.getUrl(),
      fileName: fileName
    };

    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON)
      .addHeader("Access-Control-Allow-Origin", "*");
  } catch (error) {
    var errorResponse = {
      status: "error",
      message: error.toString()
    };
    return ContentService.createTextOutput(JSON.stringify(errorResponse))
      .setMimeType(ContentService.MimeType.JSON)
      .addHeader("Access-Control-Allow-Origin", "*");
  }
}

// Menangani permintaan Preflight CORS OPTIONS dari browser
function doOptions(e) {
  return ContentService.createTextOutput("")
    .addHeader("Access-Control-Allow-Origin", "*")
    .addHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
    .addHeader("Access-Control-Allow-Headers", "Content-Type")
    .addHeader("Access-Control-Max-Age", "86400");
}

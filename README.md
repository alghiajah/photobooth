# Photobooth

Aplikasi photobooth berbasis React dan Vite. Pengunjung dapat mengambil foto, memilih bingkai, lalu mengunduh hasilnya.
Studio bisa langsung digunakan tanpa login atau registrasi.

## Menjalankan secara lokal

1. Instal dependensi dengan `npm ci`.
2. Isi konfigurasi lokal di `.env` jika memakai Google Drive.
3. Jalankan `npm run dev`.

File `.env` hanya untuk mesin lokal dan tidak di-commit. Jangan menaruh kunci privat atau service-role key di dalam aplikasi frontend.

## Deploy ke GitHub Pages

Push ke branch `main` akan menjalankan workflow GitHub Actions di `.github/workflows/deploy.yml` dan menerbitkan hasil build ke GitHub Pages.

Atur konfigurasi Google Drive deploy di **Settings → Variables → Actions** pada repository:

- Variable `VITE_GOOGLE_SCRIPT_URL`

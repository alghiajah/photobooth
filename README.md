# Photobooth

Aplikasi photobooth berbasis React dan Vite. Pengunjung dapat mengambil foto, memilih bingkai, lalu mengunduh hasilnya.

## Menjalankan secara lokal

1. Instal dependensi dengan `npm ci`.
2. Isi konfigurasi lokal di `.env` jika memakai Supabase atau Google Drive.
3. Jalankan `npm run dev`.

File `.env` hanya untuk mesin lokal dan tidak di-commit. Jangan menaruh kunci privat atau service-role key di dalam aplikasi frontend.

## Deploy ke GitHub Pages

Push ke branch `main` akan menjalankan workflow GitHub Actions di `.github/workflows/deploy.yml` dan menerbitkan hasil build ke GitHub Pages.

Atur konfigurasi deploy di **Settings → Secrets and variables → Actions** pada repository:

- Variable `VITE_SUPABASE_URL`
- Secret `VITE_SUPABASE_ANON_KEY`
- Variable `VITE_GOOGLE_SCRIPT_URL`

Supabase anon key akan tertanam di JavaScript yang dikirim ke browser; lindungi data dengan Row Level Security dan jangan gunakan service-role key di frontend.

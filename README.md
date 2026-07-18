# keuriqAI — Aplikasi Pencatatan Keuangan Pribadi & Manajemen Aset

Aplikasi pencatatan keuangan pribadi berbasis web yang membantu Anda mengelola arus kas, cicilan, aset, dan penyusutan dalam satu tempat. Dibangun sebagai **Progressive Web App (PWA)** — dapat diinstal di desktop maupun mobile.

---

## Fitur

### 💰 Manajemen Kas
- **Saldo Awal** — Catat saldo awal periode
- **Penerimaan** — Catat pemasukan (gaji, bonus, penjualan, dll)
- **Pengeluaran** — Catat pengeluaran harian dengan kategori
- **FIFO** — Alokasi dana *First-In First-Out* — lacak sumber dana mana yang membiayai pengeluaran

### 📅 Manajemen Cicilan
- Catat cicilan dengan total harga, uang muka, tenor, dan cicilan bulanan
- **Pembayaran per periode** — Bayar per bulan dengan status Lunas / Belum Dibayar
- Progress bar & persentase pembayaran
- Otomatis buat transaksi pengeluaran tiap pembayaran
- Deteksi lunas otomatis

### 🏗️ Manajemen Aset
- Catat aset dengan nomor register otomatis (`REG-YYYYMM-XXX`)
- Kategori, lokasi, dan keterangan
- **Penyusutan garis lurus** — Grafik & tabel penyusutan per tahun
- **Riwayat perubahan** — Setiap edit tercatat (siapa, kapan, sebelum/sesudah)
- Peringatan aset mendekati akhir masa manfaat

### 📊 Laporan & Ekspor
- **Laporan Saldo** — Ringkasan pemasukan, pengeluaran, saldo
- **Laporan FIFO** — Rincian alokasi dana
- **Laporan Pengeluaran** — Analisis per kategori
- **Laporan Cicilan** — Status seluruh cicilan
- **Laporan Penyusutan** — Jadwal penyusutan seluruh aset
- **Register Aset** — Detail lengkap per aset
- Ekspor: **PDF**, **Excel**, **Print**

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| **Frontend** | React 19, TypeScript, Tailwind CSS v4, Vite 8 |
| **Backend** | Laravel 13, PHP 8.3 |
| **Database** | MySQL / SQLite |
| **Auth** | Paseto V4 (XChaCha20-Poly1305) + Refresh Token Rotation |
| **Charts** | Recharts |
| **PWA** | vite-plugin-pwa (Workbox, offline support) |
| **Export** | xlsx (SheetJS) |

---

## Prasyarat

- **PHP** ≥ 8.3 + Composer
- **Node.js** ≥ 20 + npm
- **MySQL** 8.0 (atau gunakan SQLite untuk development)

---

## Instalasi

### 1. Clone repositori

```bash
git clone https://github.com/<username>/keuriqAI.git
cd keuriqAI
```

### 2. Setup Backend (Laravel)

```bash
cd backend

# Install dependencies PHP
composer install

# Salin .env dan generate app key
cp .env.example .env
php artisan key:generate

# Konfigurasi database di .env
# SQLite (default, tanpa setup tambahan):
#   DB_CONNECTION=sqlite
# MySQL:
#   DB_CONNECTION=mysql
#   DB_HOST=127.0.0.1
#   DB_PORT=3306
#   DB_DATABASE=keuriq_ai
#   DB_USERNAME=root
#   DB_PASSWORD=

# Jalankan migrasi
php artisan migrate

# (Opsional) Isi data contoh
php artisan db:seed
```

### 3. Setup Frontend

```bash
cd ..  # kembali ke root project

# Install dependencies
npm install

# Build frontend
npm run build
```

---

## Menjalankan Aplikasi

### Development

```bash
# Terminal 1 — Backend (port 8000)
cd backend && php artisan serve

# Terminal 2 — Frontend (port 5173)
npm run dev
```

Buka **http://localhost:5173** di browser.

Vite mem-proxy request `/api` ke backend Laravel di `localhost:8000`.

### Production

```bash
cd backend && php artisan serve
# Akses via http://localhost:8000
```

---

## Akun Default

Setelah menjalankan `php artisan db:seed`:

| Field | Nilai |
|---|---|
| **Email** | `admin@keuriq.ai` |
| **Password** | `password` |

---

## Struktur Proyek

```
keuriqAI/
├── backend/                     # Laravel API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/ # Auth, Transaction, Installment,
│   │   │   │                      Asset, Report, Depreciation, FIFO
│   │   │   ├── Requests/        # Form validasi
│   │   │   ├── Resources/       # Transformasi JSON response
│   │   │   └── Middleware/
│   │   ├── Models/              # User, Transaction, Installment,
│   │   │                          InstallmentPayment, Asset, AssetChange
│   │   ├── Services/            # Balance, FIFO, Installment, Depreciation, Auth
│   │   └── ValueObjects/        # DTO: BalanceResult, InstallmentStats, dll
│   ├── database/migrations/     # Skema database
│   ├── database/seeders/        # Data contoh
│   ├── routes/api.php           # Semua route API
│   └── config/
│
├── src/                         # React SPA
│   ├── api/                     # API client & service functions
│   ├── components/
│   │   ├── common/              # Button, Card, Modal, Input, TabNav, dll
│   │   └── layout/              # AppLayout, Header, Sidebar
│   ├── contexts/                # React Context: Auth, Transaction,
│   │                              Installment, Asset, FIFO
│   ├── hooks/                   # Custom hooks
│   ├── pages/                   # Halaman aplikasi
│   ├── types/                   # TypeScript type definitions
│   └── utils/                   # Formatters, depreciation, FIFO, export
│
├── public/                      # Favicon, PWA icons
├── vite.config.ts               # Vite config + PWA + proxy
├── package.json
└── prd_v1.md                    # Dokumen PRD
```

---

## API Endpoints

### Auth (Public)
| Method | Endpoint | Deskripsi |
|---|---|---|
| POST | `/api/auth/register` | Registrasi |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh token |

### Protected (Bearer Token)
| Method | Endpoint | Deskripsi |
|---|---|---|
| **Kas / Transaksi** | | |
| GET/POST | `/api/transactions` | List / Tambah transaksi |
| GET/PUT/DELETE | `/api/transactions/{id}` | Detail / Ubah / Hapus |
| GET | `/api/transactions/type/{type}` | Filter: `saldo_awal`, `penerimaan`, `pengeluaran` |
| **Cicilan** | | |
| GET/POST | `/api/installments` | List / Tambah cicilan |
| GET/PUT/DELETE | `/api/installments/{id}` | Detail / Ubah / Hapus cicilan |
| GET | `/api/installments/{id}/periods` | Daftar periode pembayaran |
| GET/POST | `/api/installments/{id}/payments` | List / Bayar cicilan |
| GET | `/api/installments/{id}/stats` | Statistik pembayaran |
| DELETE | `/api/payments/{id}` | Hapus pembayaran |
| **Aset** | | |
| GET/POST | `/api/assets` | List / Tambah aset |
| GET/PUT/DELETE | `/api/assets/{id}` | Detail / Ubah / Hapus aset |
| GET | `/api/assets/{id}/history` | Riwayat perubahan aset |
| **Laporan** | | |
| GET | `/api/reports/balance` | Saldo saat ini |
| GET | `/api/reports/fifo` | Alokasi FIFO |
| GET | `/api/reports/monthly-summary/{y}/{m}` | Ringkasan bulanan |
| GET | `/api/reports/yearly-summary/{y}` | Ringkasan tahunan |
| GET | `/api/reports/cashflow/{y}` | Data cashflow |
| GET | `/api/reports/depreciation` | Penyusutan agregat |
| GET | `/api/reports/depreciation/{id}` | Penyusutan per aset |

---

## PWA

Aplikasi ini adalah **Progressive Web App**. Setelah dibuka di browser, pengguna dapat:

- **Desktop**: Klik ikon install di address bar
- **Mobile (Android)**: Tap "Tambahkan ke Layar Utama"
- **iOS (Safari)**: Tap Share → Add to Home Screen

Mode offline didukung via Service Worker (Workbox).

---

## Scripts

### Frontend (root)
```bash
npm run dev        # Vite dev server
npm run build      # TypeScript check + Vite build
npm run preview    # Preview production build
npm run lint       # oxlint
```

### Backend (`backend/`)
```bash
php artisan serve              # Development server
php artisan migrate            # Jalankan migrasi
php artisan db:seed            # Isi data contoh
php artisan migrate:fresh --seed  # Reset + seed ulang
composer setup                 # Setup otomatis (lihat composer.json)
composer dev                   # Jalankan server + queue + vite
composer test                  # Jalankan unit test
```

---

## Lisensi

Proyek ini bersifat *private*.

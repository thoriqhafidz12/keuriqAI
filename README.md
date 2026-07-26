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

## 🚀 Deployment

Panduan lengkap deployment ke production. Arsitektur yang direkomendasikan:

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Frontend   │ ───▶ │   Backend    │ ───▶ │   Database   │
│   (Vercel)   │ API  │  (Railway)   │ SQL  │ (Aiven MySQL) │
│   React SPA  │      │  Laravel API │      │              │
└──────────────┘      └──────────────┘      └──────────────┘
```

### Opsi Deployment

| Opsi | Backend | Frontend | Database | Cocok Untuk |
|---|---|---|---|---|
| **A** ✅ | Railway (Docker) | Vercel | Aiven MySQL | Production, free tier tersedia |
| **B** | Docker Compose | Nginx static | MySQL container | Self-hosted VPS |
| **C** | VPS Manual | VPS Manual | MySQL VPS | Kontrol penuh, 1 server |

---

### Opsi A — Railway + Vercel (Recommended Production)

#### Prasyarat
- Akun [Railway](https://railway.app) (backend)
- Akun [Vercel](https://vercel.com) (frontend)
- Akun [Aiven](https://aiven.io) (managed MySQL) — atau MySQL provider lain

---

#### 1. Setup Database (Aiven MySQL)

1. Buat akun dan login ke [Aiven Console](https://console.aiven.io)
2. Klik **Create Service** → pilih **MySQL**
3. Pilih plan (minimal **Hobbyist** untuk production)
4. Setelah service siap, catat kredensial:
   - Host, Port, Database, Username, Password
5. Aktifkan **SSL** (Aiven menggunakan Let's Encrypt — didukung otomatis)

---

#### 2. Deploy Backend ke Railway

Railway menggunakan `Dockerfile` di `backend/` dan file konfigurasi `railway.json`.

**Langkah-langkah:**

1. **Push repositori ke GitHub** *(pastikan kredensial database TIDAK ada di repo)*
   ```bash
   git add .
   git commit -m "Deploy backend"
   git push origin main
   ```

2. **Buat project di Railway**
   - Buka [Railway Dashboard](https://railway.app/dashboard)
   - Klik **New Project** → **Deploy from GitHub**
   - Pilih repositori `keuriqAI`
   - Railway akan otomatis mendeteksi `Dockerfile` di `backend/`

3. **Atur Root Directory**
   - Buka tab **Settings** pada service
   - Set **Root Directory** ke `backend/`

4. **Set Environment Variables** di Railway:
   ```
   APP_NAME=keuriqAI
   APP_ENV=production
   APP_DEBUG=false
   APP_KEY=base64:<GENERATE_DENGAN_php_artisan_key_generate>
   APP_URL=https://<nama-service>.railway.app
   FRONTEND_URL=https://<nama-project>.vercel.app

   DB_CONNECTION=mysql
   DB_HOST=<aiven-host>
   DB_PORT=<aiven-port>
   DB_DATABASE=defaultdb
   DB_USERNAME=<aiven-username>
   DB_PASSWORD=<aiven-password>

   MYSQL_ATTR_SSL_CA=/etc/ssl/certs/ca-certificates.crt
   MYSQL_ATTR_SSL_VERIFY_SERVER_CERT=false

   SESSION_DRIVER=database
   CACHE_STORE=database
   QUEUE_CONNECTION=database

   SANCTUM_STATEFUL_DOMAINS=
   SESSION_LIFETIME=120
   ```

5. **Generate APP_KEY**:
   ```bash
   cd backend
   php artisan key:generate --show
   # Copy output dan paste ke APP_KEY di Railway
   ```

6. **Deploy** — Railway akan build Docker image dan menjalankan container. Cek log di tab **Deployments**.

7. **Verifikasi backend** — buka `https://<nama-service>.railway.app/up`

> **Catatan**: `docker-entrypoint.sh` akan otomatis menjalankan `php artisan migrate --force` setiap deploy. Migration bersifat idempotent — aman dijalankan berulang kali.

---

#### 3. Deploy Frontend ke Vercel

**Langkah-langkah:**

1. **Install Vercel CLI** (opsional, bisa pakai web UI):
   ```bash
   npm i -g vercel
   ```

2. **Deploy via Vercel Dashboard**:
   - Buka [Vercel Dashboard](https://vercel.com/dashboard)
   - Klik **Add New** → **Project**
   - Import repositori `keuriqAI`
   - Konfigurasi build:
     - **Framework Preset**: Vite
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
     - **Root Directory**: `.` (root project)

3. **Set Environment Variables** di Vercel:
   ```
   VITE_API_TARGET=https://<nama-service>.railway.app
   ```

4. **Deploy** — Vercel akan build dan deploy otomatis.

5. **Custom Domain** (opsional) — tambahkan domain kustom di tab **Domains**.

6. **Verifikasi frontend** — buka `https://<nama-project>.vercel.app`

---

#### 4. CORS & Keamanan

Pastikan CORS sudah dikonfigurasi di backend (`backend/config/cors.php`):

```php
return [
    'paths' => ['api/*'],
    'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:5173')],
    'allowed_methods' => ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    'allowed_headers' => ['Content-Type', 'Authorization'],
];
```

> **Penting**: Selalu set `FRONTEND_URL` ke URL production Vercel. Jangan gunakan `*` di production.

---

### Opsi B — Docker Compose (Self-hosted VPS)

Untuk deployment di satu server VPS menggunakan Docker Compose.

#### 1. Buat file `docker-compose.yml` di root project:

```yaml
version: "3.8"

services:
  # ─── MySQL Database ──────────────────────────
  mysql:
    image: mysql:8.0
    container_name: keuriqai-db
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD:-rootsecret}
      MYSQL_DATABASE: keuriq_ai
      MYSQL_USER: keuriqai
      MYSQL_PASSWORD: ${DB_PASSWORD:-keuriqai_secret}
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "127.0.0.1:3306:3306"
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ─── Laravel Backend ─────────────────────────
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: keuriqai-backend
    restart: unless-stopped
    ports:
      - "127.0.0.1:8000:8000"
    environment:
      APP_NAME: keuriqAI
      APP_ENV: production
      APP_DEBUG: "false"
      APP_KEY: ${APP_KEY}
      APP_URL: https://keuriqai.example.com
      FRONTEND_URL: https://keuriqai.example.com
      DB_CONNECTION: mysql
      DB_HOST: mysql
      DB_PORT: 3306
      DB_DATABASE: keuriq_ai
      DB_USERNAME: keuriqai
      DB_PASSWORD: ${DB_PASSWORD:-keuriqai_secret}
      SESSION_DRIVER: database
      CACHE_STORE: database
      QUEUE_CONNECTION: database
      SANCTUM_STATEFUL_DOMAINS:
      SESSION_LIFETIME: 120
    depends_on:
      mysql:
        condition: service_healthy

  # ─── Nginx (Frontend Static + Reverse Proxy) ─
  nginx:
    image: nginx:alpine
    container_name: keuriqai-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./dist:/usr/share/nginx/html:ro
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - ./ssl:/etc/nginx/ssl:ro  # Opsional: HTTPS
    depends_on:
      - backend

volumes:
  mysql_data:
```

#### 2. Buat file `nginx.conf`:

```nginx
server {
    listen 80;
    server_name keuriqai.example.com;

    # Frontend static files
    root /usr/share/nginx/html;
    index index.html;

    # PWA & SPA — serve index.html untuk semua route
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API ke backend Laravel
    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### 3. Deploy:

```bash
# Build frontend
npm run build

# Generate APP_KEY
cd backend && php artisan key:generate --show && cd ..

# Simpan APP_KEY di .env.production.docker
echo "APP_KEY=base64:..." > .env.production.docker
echo "DB_PASSWORD=keuriqai_secret" >> .env.production.docker

# Build & jalankan semua container
docker compose --env-file .env.production.docker up -d --build

# Cek status
docker compose ps
docker compose logs backend
```

---

### Opsi C — VPS Manual

Untuk deployment manual di satu server VPS (Ubuntu/Debian).

#### 1. Install dependencies:

```bash
# PHP 8.3 + extensions
sudo apt update
sudo apt install -y php8.3 php8.3-cli php8.3-fpm php8.3-mysql \
    php8.3-mbstring php8.3-bcmath php8.3-xml php8.3-gd php8.3-gmp \
    composer nginx mysql-server nodejs npm

# Atau gunakan Ondrej PPA untuk versi PHP terbaru:
# sudo add-apt-repository ppa:ondrej/php -y
```

#### 2. Clone & setup backend:

```bash
git clone https://github.com/thoriqhafidz12/keuriqAI.git /var/www/keuriqai
cd /var/www/keuriqai/backend

cp .env.example .env
php artisan key:generate

# Edit .env dengan kredensial database production
# DB_DATABASE=keuriq_ai
# DB_USERNAME=keuriqai
# DB_PASSWORD=<secure-password>

php artisan migrate --force
php artisan config:cache
php artisan route:cache

# Set permission
sudo chown -R www-data:www-data storage bootstrap/cache
```

#### 3. Build frontend:

```bash
cd /var/www/keuriqai
npm install
npm run build
# Output di /var/www/keuriqai/dist/
```

#### 4. Konfigurasi Nginx:

```nginx
server {
    listen 80;
    server_name keuriqai.example.com;
    root /var/www/keuriqai/dist;

    index index.html;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API ke Laravel
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

#### 5. Jalankan backend sebagai systemd service:

```ini
# /etc/systemd/system/keuriqai-backend.service
[Unit]
Description=keuriqAI Backend
After=network.target mysql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/keuriqai/backend
ExecStart=/usr/bin/php artisan serve --host=0.0.0.0 --port=8000
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now keuriqai-backend
sudo systemctl restart nginx
```

#### 6. HTTPS dengan Certbot (Let's Encrypt):

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d keuriqai.example.com
```

---

### Health Check

Setelah deploy, verifikasi semua endpoint:

```bash
# Backend health check
curl https://backend-kamu.railway.app/up
# Response: HTTP 200

# Backend API (butuh auth)
curl https://backend-kamu.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@keuriq.ai","password":"password"}'

# Frontend
curl -I https://frontend-kamu.vercel.app
# Response: HTTP 200
```

---

### CI/CD (Opsional)

Proyek ini sudah terintegrasi dengan Git — setiap push ke `main` akan:

| Platform | Trigger | Aksi |
|---|---|---|
| **Railway** | Push ke `main` | Auto-build Docker image & deploy backend |
| **Vercel** | Push ke `main` | Auto-build Vite & deploy frontend |

Tidak perlu setup CI/CD tambahan. Cukup push ke GitHub dan kedua platform akan otomatis deploy.

---

### Environment Variables Reference

#### Backend (Railway / Docker)

| Variable | Deskripsi | Contoh |
|---|---|---|
| `APP_KEY` | Laravel encryption key | `base64:...` |
| `APP_URL` | URL backend | `https://api.example.com` |
| `FRONTEND_URL` | URL frontend (untuk CORS) | `https://example.com` |
| `DB_HOST` | MySQL host | `mysql-xxx.aivencloud.com` |
| `DB_PORT` | MySQL port | `12628` |
| `DB_DATABASE` | Nama database | `defaultdb` |
| `DB_USERNAME` | Username database | `avnadmin` |
| `DB_PASSWORD` | Password database | `AVNS_...` |
| `MYSQL_ATTR_SSL_CA` | Path CA cert SSL (Aiven) | `/etc/ssl/certs/ca-certificates.crt` |
| `MYSQL_ATTR_SSL_VERIFY_SERVER_CERT` | Verifikasi cert server | `false` |

#### Frontend (Vercel)

| Variable | Deskripsi | Contoh |
|---|---|---|
| `VITE_API_TARGET` | URL backend API | `https://api.example.com` |

> ⚠️ **Peringatan Keamanan**: Jangan pernah commit file `.env` atau `.env.production` ke repositori. Gunakan environment variables di platform deployment masing-masing.

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

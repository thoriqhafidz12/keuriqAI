# Product Requirements Document (PRD)

# Aplikasi Pencatatan Keuangan Pribadi & Manajemen Aset

**Versi** : 1.0
**Platform** : Web Application (Responsive)
**Target Berikutnya** : Progressive Web App (PWA)
**Status** : Draft

---

# 1. Latar Belakang

Banyak aplikasi pencatatan keuangan hanya mencatat pemasukan dan pengeluaran tanpa memberikan informasi mengenai asal dana yang digunakan, sisa saldo berdasarkan transaksi, pengelolaan cicilan, maupun penyusutan aset.

Aplikasi ini bertujuan menjadi pusat pengelolaan keuangan pribadi yang mampu:

* mencatat seluruh transaksi kas,
* menghitung saldo secara otomatis,
* menghasilkan laporan FIFO,
* mengelola cicilan,
* menghitung penyusutan aset.

Aplikasi dikembangkan sebagai aplikasi web yang nantinya dapat diinstal menjadi Progressive Web App (PWA) sehingga dapat digunakan layaknya aplikasi mobile.

---

# 2. Tujuan Produk

## Tujuan Utama

Membantu pengguna mengelola kondisi keuangan secara lengkap dalam satu aplikasi.

## Tujuan Bisnis

* Mengurangi pencatatan manual.
* Mengetahui posisi saldo secara real-time.
* Mengetahui sumber saldo yang masih tersisa menggunakan metode FIFO.
* Mengelola cicilan dengan mudah.
* Mengetahui nilai buku aset setiap tahun.

---

# 3. Target Pengguna

* Pengguna pribadi
* Freelancer
* Pegawai
* UMKM
* Mahasiswa

---

# 4. Ruang Lingkup (Scope)

## In Scope

* Saldo awal
* Penerimaan kas
* Pengeluaran kas
* Laporan FIFO
* Saldo berjalan
* Cicilan
* Penyusutan aset
* Dashboard
* PWA

## Out of Scope

* Multi user
* Sinkronisasi Bank
* QRIS
* Invoice
* Pajak

---

# 5. Modul Aplikasi

## Modul Dashboard

Menampilkan ringkasan:

* Total Saldo
* Total Penerimaan
* Total Pengeluaran
* Total Cicilan Berjalan
* Total Nilai Buku Aset
* Grafik Cashflow
* Pengeluaran Bulan Ini
* Penerimaan Bulan Ini

---

# Modul Kas

Menu:

* Saldo Awal
* Penerimaan
* Pengeluaran

---

## Saldo Awal

Input

* Tanggal
* Nominal
* Keterangan

Hanya boleh terdapat satu saldo awal aktif.

---

## Penerimaan

Input

* Tanggal
* Nominal
* Kategori
* Sumber
* Keterangan

Contoh

* Gaji
* Bonus
* Penjualan
* THR
* Cashback

---

## Pengeluaran

Input

* Tanggal
* Nominal
* Kategori
* Keterangan

Contoh

* Makan
* BBM
* Belanja
* Listrik
* Internet

---

# 6. Perhitungan Saldo

Saldo dihitung otomatis.

Rumus

Saldo Akhir

=

Saldo Awal

*

Total Penerimaan

*

Total Pengeluaran

Perubahan saldo terjadi setiap transaksi.

---

# 7. Laporan FIFO

Metode FIFO digunakan untuk mengetahui sumber dana yang digunakan ketika terjadi pengeluaran.

Contoh

Saldo Awal

Rp2.000.000

Penerimaan

1 Januari

Rp5.000.000

5 Januari

Rp3.000.000

Pengeluaran

10 Januari

Rp6.000.000

Maka sistem mengambil dana:

Saldo Awal

Rp2.000.000

*

Penerimaan 1 Januari

Rp4.000.000

Sisa

Penerimaan 1 Januari

Rp1.000.000

Penerimaan 5 Januari

Rp3.000.000

Laporan FIFO akan memperlihatkan:

* Dana berasal dari transaksi mana
* Berapa nominal yang sudah digunakan
* Berapa sisa setiap penerimaan

---

# 8. Modul Cicilan

Pengguna dapat mencatat pembelian secara cicilan.

Input Awal

* Nama Cicilan
* Total Harga
* Uang Muka
* Lama Cicilan
* Tanggal Mulai
* Nominal Cicilan Bulanan

Status

* Berjalan
* Lunas

---

## Pembayaran Cicilan

Input

* Tanggal
* Nominal Bayar
* Keterangan

Setiap pembayaran otomatis menjadi transaksi pengeluaran.

Sistem menghitung:

* Total Sudah Dibayar
* Sisa Cicilan
* Persentase Pelunasan
* Status

Jika pembayaran terakhir dilakukan maka status berubah menjadi:

"Lunas"

---

# 9. Modul Penyusutan Aset

Digunakan menghitung nilai buku aset.

Input

* Nama Barang
* Nilai Perolehan
* Tanggal Perolehan
* Tahun Perolehan
* Masa Manfaat
* Nilai Residu (opsional)

Metode

Garis Lurus (Straight Line)

Rumus

Penyusutan Tahunan

=

(Nilai Perolehan - Nilai Residu)

/

Masa Manfaat

Sistem menghasilkan:

* Beban Penyusutan
* Akumulasi Penyusutan
* Nilai Buku

Contoh

Laptop

Rp18.000.000

Masa Manfaat

4 Tahun

Penyusutan

Rp4.500.000/tahun

---

# 10. Dashboard Penyusutan

Menampilkan

* Total Nilai Perolehan
* Total Akumulasi Penyusutan
* Total Nilai Buku
* Aset Hampir Habis Masa Manfaat

---

# 11. Laporan

Laporan Saldo

* Harian
* Bulanan
* Tahunan

Laporan FIFO

* Detail Penggunaan Dana
* Sisa Dana Setiap Penerimaan

Laporan Pengeluaran

Filter

* Tanggal
* Kategori

Laporan Cicilan

* Sedang Berjalan
* Lunas
* Riwayat Pembayaran

Laporan Penyusutan

* Nilai Buku
* Akumulasi
* Penyusutan Tahunan

---

# 12. Functional Requirements

## FR-001

User dapat menginput saldo awal.

---

## FR-002

User dapat menginput penerimaan.

---

## FR-003

User dapat menginput pengeluaran.

---

## FR-004

Sistem menghitung saldo otomatis.

---

## FR-005

Sistem membuat laporan FIFO.

---

## FR-006

User dapat membuat cicilan.

---

## FR-007

User dapat membayar cicilan.

---

## FR-008

Pembayaran cicilan otomatis menjadi pengeluaran.

---

## FR-009

User dapat menambah aset.

---

## FR-010

Sistem menghitung penyusutan otomatis.

---

## FR-011

Sistem menghasilkan laporan penyusutan.

---

## FR-012

Dashboard menampilkan ringkasan seluruh data.

---

# 13. Non Functional Requirements

Performance

* Respon < 2 detik

Security

* Login
* Enkripsi Password
* Session Management

Reliability

* Backup Database

Compatibility

* Chrome
* Edge
* Firefox
* Safari

Responsive

* Desktop
* Tablet
* Mobile

---

# 14. PWA Requirements

Aplikasi harus dapat di-install.

Fitur:

* Install App
* Offline Cache
* Responsive
* Push Notification (future)
* Background Sync (future)

---

# 15. Database (Konseptual)

## transaksi

* id
* tanggal
* jenis
* kategori
* nominal
* saldo_setelah
* keterangan

---

## fifo_detail

* id
* transaksi_masuk
* transaksi_keluar
* nominal_terpakai

---

## cicilan

* id
* nama
* total
* uang_muka
* tenor
* mulai
* status

---

## cicilan_pembayaran

* id
* cicilan_id
* tanggal
* nominal

---

## aset

* id
* nama
* nilai
* tahun_perolehan
* masa_manfaat
* nilai_residu

---

# 16. Acceptance Criteria

Pengguna dapat melihat saldo kapan saja.

Saldo selalu sesuai seluruh transaksi.

FIFO selalu menunjukkan sumber dana yang digunakan.

Pembayaran cicilan otomatis mengurangi saldo.

Penyusutan berubah ketika tahun berjalan berubah.

Seluruh laporan dapat difilter berdasarkan tanggal.

---

# 17. Roadmap

## Versi 1.0

* Login
* Dashboard
* Kas
* FIFO
* Cicilan
* Penyusutan

## Versi 1.1

* Export Excel
* Export PDF
* Backup

## Versi 1.2

* PWA
* Push Notification
* Dark Mode

## Versi 2.0

* Multi User
* Cloud Sync
* API
* Android Wrapper
* iOS Wrapper

# PRD v1.1 - Change Request

**Dokumen** : PRD Perubahan Sistem Pencatatan Keuangan dan Aset  
**Versi** : 1.1  
**Tanggal** : 18 Juli 2026  
**Status** : Draft

---

# 1. Ringkasan Perubahan

Berdasarkan hasil evaluasi penggunaan aplikasi, terdapat beberapa kebutuhan baru yang akan ditambahkan pada sistem tanpa mengubah alur utama yang telah berjalan.

Perubahan yang dilakukan meliputi:

1. Pengembangan fitur pembayaran cicilan per bulan.
2. Penambahan fitur Edit Data Aset.
3. Penambahan halaman Detail Data beserta menu laporan.

---

# 2. Perubahan Fitur

## 2.1 Pengembangan Modul Cicilan

### Latar Belakang

Saat ini sistem hanya menyimpan informasi total cicilan dan jangka waktu cicilan. Sistem belum dapat mencatat pembayaran yang telah dilakukan setiap bulan.

### Kebutuhan

Sistem harus memungkinkan pengguna mencatat pembayaran cicilan sesuai periode yang telah ditentukan.

### Functional Requirements

#### FR-C01

Pengguna dapat membuka halaman detail cicilan.

#### FR-C02

Sistem menampilkan seluruh periode cicilan berdasarkan lama cicilan.

Contoh:

| Periode | Nominal | Status |
|----------|----------|--------|
| Bulan 1 | Rp500.000 | Lunas |
| Bulan 2 | Rp500.000 | Lunas |
| Bulan 3 | Rp500.000 | Belum Dibayar |

#### FR-C03

Pengguna dapat melakukan pembayaran pada setiap periode.

Field pembayaran:

- Tanggal Bayar
- Nominal Dibayar
- Keterangan

#### FR-C04

Setelah pembayaran disimpan sistem otomatis menghitung:

- Total Sudah Dibayar
- Total Sisa Cicilan
- Sisa Periode
- Persentase Pembayaran

#### FR-C05

Status cicilan berubah menjadi **Lunas** apabila seluruh periode telah dibayar.

### Business Rules

- Nominal pembayaran tidak boleh melebihi sisa cicilan.
- Satu periode hanya dapat dibayar satu kali.
- Pembayaran dapat dilakukan sesuai urutan maupun pada periode tertentu sesuai kebutuhan bisnis.

---

## 2.2 Edit Data Aset

### Latar Belakang

Data aset yang telah disimpan saat ini tidak dapat diperbaiki apabila terjadi kesalahan input.

### Kebutuhan

Menambahkan fitur Edit Data Aset.

### Functional Requirements

#### FR-A01

Pada daftar aset ditambahkan tombol:

- Detail
- Edit
- Hapus

#### FR-A02

Pengguna dapat mengubah:

- Nama Barang
- Kategori
- Lokasi
- Harga Perolehan
- Tanggal Perolehan
- Masa Manfaat
- Nilai Residu
- Keterangan

#### FR-A03

Nomor Register tidak dapat diubah.

#### FR-A04

Apabila Harga Perolehan atau Masa Manfaat berubah maka sistem menghitung ulang penyusutan.

#### FR-A05

Seluruh perubahan disimpan sebagai riwayat perubahan.

Riwayat minimal berisi:

- Tanggal
- User
- Data Sebelum
- Data Sesudah

---

## 2.3 Halaman Detail Data

### Latar Belakang

Saat ini data hanya ditampilkan dalam bentuk tabel sehingga pengguna harus membuka menu lain untuk melihat informasi yang lebih lengkap.

### Kebutuhan

Setiap data dapat dibuka dalam halaman detail.

### Functional Requirements

#### FR-D01

Setiap baris data dapat diklik untuk membuka halaman detail.

#### FR-D02

Halaman detail aset menampilkan:

- Informasi Umum
- Informasi Penyusutan
- Riwayat Perubahan

#### FR-D03

Halaman detail cicilan menampilkan:

- Informasi Cicilan
- Riwayat Pembayaran
- Progress Pembayaran

---

# 3. Penambahan Menu Laporan

Pada halaman Detail ditambahkan tombol:

**Laporan**

Pilihan laporan meliputi:

## Register

Menampilkan informasi lengkap data.

Output:

- PDF
- Excel
- Print

---

## Rekapan

Menampilkan ringkasan data berdasarkan kategori.

Contoh:

| Kategori | Jumlah | Nilai |
|-----------|---------|--------|

---

## Rekapan Penyusutan

Menampilkan:

- Nilai Perolehan
- Total Penyusutan
- Nilai Buku

---

## Rekapan Cicilan

Menampilkan:

- Nama Cicilan
- Total Cicilan
- Sudah Dibayar
- Sisa Cicilan
- Status

Output:

- PDF
- Excel
- Print

---

# 4. Perubahan Antarmuka

## Menu Cicilan

Tambahan:

- Tombol Bayar Cicilan
- Progress Bar Pembayaran
- Persentase Pembayaran
- Status Lunas / Belum Lunas

---

## Menu Aset

Tambahan:

- Detail
- Edit
- Riwayat
- Laporan

---

## Halaman Detail

Terdapat tab:

- Informasi
- Penyusutan
- Riwayat
- Laporan

---

# 5. Acceptance Criteria

| No | Kriteria |
|----|----------|
| AC-01 | Pengguna dapat mencatat pembayaran cicilan setiap periode. |
| AC-02 | Sistem menghitung otomatis sisa cicilan dan progress pembayaran. |
| AC-03 | Sistem menolak pembayaran ganda pada periode yang sama. |
| AC-04 | Pengguna dapat mengubah data aset tanpa mengubah nomor register. |
| AC-05 | Seluruh perubahan aset tersimpan pada histori perubahan. |
| AC-06 | Pengguna dapat membuka halaman detail setiap data. |
| AC-07 | Halaman detail menampilkan informasi lengkap beserta histori. |
| AC-08 | Sistem menyediakan laporan Register, Rekapan, Penyusutan, dan Rekapan Cicilan. |
| AC-09 | Seluruh laporan dapat diekspor ke PDF, Excel, dan dicetak. |

---

# 6. Dampak Perubahan

## Modul Cicilan

- Penambahan detail pembayaran cicilan.
- Penambahan perhitungan progress pembayaran.

## Modul Aset

- Penambahan fitur edit.
- Penambahan histori perubahan aset.

## Modul Detail

- Penambahan halaman detail.
- Penambahan navigasi menuju laporan.

## Modul Laporan

- Register
- Rekapan
- Rekapan Penyusutan
- Rekapan Cicilan

Perubahan ini bersifat **backward compatible** sehingga tidak mengubah data yang telah ada pada sistem sebelumnya.
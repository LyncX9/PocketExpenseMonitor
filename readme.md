PocketExpenseMonitor

PocketExpenseMonitor adalah aplikasi personal finance tracker berbasis React Native + Expo + TypeScript dengan fitur lengkap untuk mencatat pemasukan, pengeluaran, grafik keuangan, budget threshold, notifikasi, dan currency conversion otomatis. Aplikasi dirancang modular dengan arsitektur Service Layer sehingga mudah dikembangkan dan dipelihara.

Fitur Utama

Manajemen transaksi lengkap

Tambah Income dan Expense

Input kategori, tanggal, nominal, judul, dan catatan

Auto-format currency saat mengetik

Validasi lengkap

Dashboard modern

Ringkasan balance, total income, dan total expense

Pie Chart pengeluaran per kategori

Line Chart tren transaksi mingguan

Recent transactions

Warning alert jika melewati batas budget

Pengaturan aplikasi (Settings)

Ganti currency (IDR, USD, EUR, JPY, dll)

Budget bulanan

Alert threshold

Budget per kategori

Semua data tersimpan otomatis

Currency conversion

Menggunakan API real-time dari open.er-api.com

Semua transaksi otomatis dikonversi saat currency diganti

UI modern

60% warna putih dan 40% warna biru

Card modern, shadow lembut, tombol + melayang

Navigasi stack yang clean

Teknologi

React Native

Expo

TypeScript

React Navigation

AsyncStorage

Chart Kit

Expo Notifications

Exchange Rate API

Struktur Folder

src/components

BalanceCard.tsx

LineChartSimple.tsx

PieChartSimple.tsx

TransactionListItem.tsx

src/contexts

ServiceContext.tsx

src/navigation

AppNavigator.tsx

src/screens

HomeScreen.tsx

AddTransactionScreen.tsx

TransactionDetail.tsx

SettingsScreen.tsx

src/services

CurrencyService.ts

NotificationService.ts

SettingsManager.ts

StorageService.ts

TransactionManager.ts

src/utils

formatCurrency.ts

src/types

index.ts

Cara Install

Clone repository
git clone https://github.com/USERNAME/PocketExpenseMonitor.git

cd PocketExpenseMonitor

Install dependencies
npm install
atau jika error dependency
npm install --legacy-peer-deps

Jalankan aplikasi
npm start

Jalankan di Android emulator
npx expo run:android

Cara Menggunakan

Tambah transaksi
Tekan tombol + pada dashboard, isi semua data transaksi, lalu simpan.

Lihat detail
Tap salah satu transaksi pada daftar recent transactions.

Mengubah currency
Pergi ke Settings dan pilih currency baru. Semua data akan dikonversi otomatis.

Mengatur alert threshold
Jika pengeluaran melampaui batas, aplikasi memberi notifikasi.

Lihat grafik
Dashboard menampilkan Pie Chart dan Line Chart untuk analisis cepat.

API Eksternal

Exchange Rate API
https://open.er-api.com/v6/latest/{CURRENCY}

Digunakan untuk mendapatkan kurs terbaru dan menghitung konversi otomatis.

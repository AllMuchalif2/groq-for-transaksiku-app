# Backend AI Transaksiku (Integrasi Groq)

Layanan backend untuk aplikasi **Transaksiku** yang ditenagai oleh **Groq AI**. Layanan ini menyediakan pemrosesan bahasa alami untuk ekstraksi transaksi dan wawasan keuangan.

## 📱 Repository Aplikasi Flutter

Frontend aplikasi ini dapat ditemukan di:
👉 **[Transaksiku App (Flutter)](https://github.com/AllMuchalif2/transaksiku-app/)**

---

## 🛠️ Cara Install & Jalankan

Ikuti langkah-langkah berikut untuk menjalankan layanan ini di komputer lokal Anda.

### 1. Clone Repository

```bash
git clone https://github.com/AllMuchalif2/groq-for-transaksiku-app.git
cd groq-for-transaksiku-app
```

### 2. Install Dependensi

Pastikan Anda sudah menginstall [Node.js](https://nodejs.org/).

```bash
npm install
```

### 3. Konfigurasi Environment

Salin file `.env.example` menjadi `.env`:

```bash
cp .env.example .env
# Atau di Windows Command Prompt:
# copy .env.example .env
```

### 4. Dapatkan API Key Groq

Layanan ini menggunakan Groq AI. Anda membutuhkan API Key gratis.

1. Buka [Groq Cloud Console](https://console.groq.com/keys).
2. Login atau Buat Akun.
3. Klik **Create API Key**.
4. Salin API Key tersebut.
5. Buka file `.env` yang baru dibuat, lalu isi `GROQ_API_KEY`:

```env
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxx
APP_SECRET=rahasia-dapur  # Ganti dengan secret key pilihan Anda (bebas)
PORT=3000
```

### 5. Jalankan Server

```bash
npm start
```

Server akan berjalan di `http://localhost:3000`.

---

## URL Dasar (Base URL)

- **Lokal**: `http://localhost:3000/api`
- **Produksi**: `https://<domain-vercel-anda>.vercel.app/api` (Sesuaikan dengan deployment Anda)

## Otentikasi

Semua permintaan (request) harus menyertakan header berikut:

| Header         | Nilai               | Deskripsi                                      |
| :------------- | :------------------ | :--------------------------------------------- |
| `x-app-secret` | `<APP_SECRET_ANDA>` | Harus cocok dengan `APP_SECRET` di file `.env` |

---

## Endpoint

### 1. Bot Cerdas (Smart Bot)

Endpoint tunggal yang menangani ekstraksi transaksi dan konsultasi keuangan. Mode ditentukan oleh isi pesan.

- **Endpoint**: `POST /bot`
- **Content-Type**: `application/json`

#### Body Permintaan (Request Body)

```json
{
  "message": "/input Beli nasi goreng 15rb", // Gunakan prefix /input untuk ekstraksi
  "transactions": [] // Opsional: Riwayat transaksi untuk konteks konsultasi
}
```

#### Respons: Mode Input (`/input`)

Jika pesan diawali dengan `/input`, bot kan mengekstrak data transaksi.

```json
{
  "success": true,
  "data": {
    "type": "transaction_created",
    "message": "Berhasil mengekstrak data transaksi.",
    "result": {
      "nama": "Nasi Goreng",
      "jumlah": 15000,
      "jenis": "pengeluaran",
      "tanggal": "2024-12-18"
    }
  }
}
```

#### Respons: Mode Konsultan (Chat Biasa)

Jika pesan adalah pertanyaan atau obrolan biasa.

```json
{
  "success": true,
  "data": {
    "type": "chat_reply",
    "message": "Keuangan Anda terlihat stabil, namun perlu diperhatikan pengeluaran harian.",
    "result": null
  }
}
```

---

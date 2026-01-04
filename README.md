# Backend AI Transaksiku (Integrasi Groq)

Layanan backend untuk aplikasi **Transaksiku** yang ditenagai oleh **Groq AI**. Layanan ini menyediakan pemrosesan bahasa alami untuk ekstraksi transaksi dan wawasan keuangan.

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

### 1. Ekstrak Transaksi dari Teks (Chat)

Mengubah teks bahasa alami menjadi data transaksi terstruktur (JSON).

- **Endpoint**: `POST /chat`
- **Content-Type**: `application/json`

#### Body Permintaan (Request Body)

> **PENTING**: Request sekarang memerlukan context data dari database lokal Flutter.

```json
{
  "message": "Beli nasi goreng 15rb",
  "kategori": [
    { "kategori_id": 1, "nama": "Makanan & Minuman", "tipe": "PENGELUARAN" },
    { "kategori_id": 2, "nama": "Transportasi", "tipe": "PENGELUARAN" },
    { "kategori_id": 5, "nama": "Gaji", "tipe": "PEMASUKAN" }
  ],
  "saldo": [
    { "saldo_id": 1, "nama": "Dompet Utama" },
    { "saldo_id": 2, "nama": "GoPay" },
    { "saldo_id": 3, "nama": "Rekening BCA" }
  ],
  "tabungan": [
    { "tabungan_id": 1, "nama": "Tabungan Liburan" },
    { "tabungan_id": 2, "nama": "Dana Darurat" }
  ]
}
```

**Field Descriptions:**

- `message` (required): Teks natural language dari user
- `kategori` (optional): Array kategori dari database. AI akan memilih `kategori_id` yang paling sesuai
- `saldo` (optional): Array saldo dari database. AI akan memilih `saldo_id` (default: ID pertama)
- `tabungan` (optional): Array tabungan dari database. AI akan memilih `tabungan_id` jika disebutkan

#### Respons (Sukses - 200)

```json
{
  "success": true,
  "data": {
    "nama": "Nasi Goreng",
    "jumlah": 15000,
    "tanggal": "2026-01-04",
    "kategori_id": 1,
    "saldo_id": 1,
    "tabungan_id": null
  }
}
```

**Response Fields:**

- `nama`: Judul transaksi
- `jumlah`: Nominal dalam IDR (integer)
- `tanggal`: Tanggal transaksi (ISO8601 format)
- `kategori_id`: ID kategori yang dipilih AI dari list yang dikirim
- `saldo_id`: ID saldo yang dipilih AI (default: ID pertama jika tidak disebutkan)
- `tabungan_id`: ID tabungan jika disebutkan, atau `null`

---

### 2. Wawasan Keuangan (Financial Insight)

Memberikan analisis berdasarkan riwayat transaksi.

- **Endpoint**: `POST /financial-insight`
- **Content-Type**: `application/json`

#### Body Permintaan (Request Body)

```json
{
  "message": "Bagaimana kondisi keuangan saya bulan ini?",
  "transactions": [
    {
      "nama": "Gaji",
      "jumlah": 5000000,
      "jenis": "pemasukan",
      "tanggal": "2024-12-01"
    },
    {
      "nama": "Kost",
      "jumlah": 1500000,
      "jenis": "pengeluaran",
      "tanggal": "2024-12-02"
    },
    {
      "nama": "Makan",
      "jumlah": 50000,
      "jenis": "pengeluaran",
      "tanggal": "2024-12-03"
    }
  ]
}
```

#### Respons (Sukses - 200)

```json
{
  "success": true,
  "data": {
    "analysis": "Keuangan Anda cukup sehat bulan ini dengan pemasukan 5jt dan total pengeluaran 1.55jt..."
  }
}
```

---

## 🚀 Contoh Integrasi Flutter

Di bawah ini adalah kelas pembantu (helper class) dalam Dart untuk menggunakan API ini menggunakan paket `http`.

### 1. Tambahkan Dependensi

Tambahkan `http` ke `pubspec.yaml` Anda:

```yaml
dependencies:
  http: ^1.2.0
```

### 2. Buat Layanan API (`groq_service.dart`)

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class GroqService {
  // Gunakan 10.0.2.2 untuk Emulator Android, atau IP LAN untuk device fisik
  static const String baseUrl = "http://YOUR_SERVER_IP:3000/api";
  static const String appSecret = "YOUR_SECRET_KEY"; // Harus cocok dengan .env

  // Helper untuk Header
  static Map<String, String> get _headers => {
        "Content-Type": "application/json",
        "x-app-secret": appSecret,
      };

  /// Ekstrak data transaksi dari teks dengan context data
  static Future<Map<String, dynamic>?> extractTransaction(
    String text, {
    required List<Map<String, dynamic>> kategori,
    required List<Map<String, dynamic>> saldo,
    List<Map<String, dynamic>>? tabungan,
  }) async {
    final url = Uri.parse("$baseUrl/chat");
    try {
      final response = await http.post(
        url,
        headers: _headers,
        body: jsonEncode({
          "message": text,
          "kategori": kategori,
          "saldo": saldo,
          "tabungan": tabungan ?? [],
        }),
      );

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        if (jsonResponse['success'] == true) {
          return jsonResponse['data'];
        }
      }
      print("Error: ${response.body}");
    } catch (e) {
      print("Exception: $e");
    }
    return null;
  }

  /// Dapatkan analisis keuangan
  static Future<String?> getFinancialInsight(
      String query, List<Map<String, dynamic>> transactions) async {
    final url = Uri.parse("$baseUrl/financial-insight");
    try {
      final response = await http.post(
        url,
        headers: _headers,
        body: jsonEncode({
          "message": query,
          "transactions": transactions,
        }),
      );

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        if (jsonResponse['success'] == true) {
          return jsonResponse['data']['analysis'];
        }
      }
      print("Error: ${response.body}");
    } catch (e) {
      print("Exception: $e");
    }
    return null;
  }
}
```

### 3. Contoh Penggunaan

```dart
void testGroq() async {
  // Tes Ekstraksi dengan context data
  final transaction = await GroqService.extractTransaction(
    "Beli bensin 20rb",
    kategori: [
      {"kategori_id": 1, "nama": "Makanan & Minuman", "tipe": "PENGELUARAN"},
      {"kategori_id": 2, "nama": "Transportasi", "tipe": "PENGELUARAN"},
    ],
    saldo: [
      {"saldo_id": 1, "nama": "Dompet Utama"},
      {"saldo_id": 2, "nama": "GoPay"},
    ],
    tabungan: [],
  );
  print("Hasil Ekstraksi: $transaction");
  // Output: {nama: Bensin, jumlah: 20000, kategori_id: 2, saldo_id: 1, tabungan_id: null, ...}

  // Tes Insight
  final insight = await GroqService.getFinancialInsight(
    "Boros ga saya?",
    [
      {"nama": "Kopi", "jumlah": 25000, "jenis": "pengeluaran", "tanggal": "2024-12-18"}
    ]
  );
  print("Analisis: $insight");
}
```

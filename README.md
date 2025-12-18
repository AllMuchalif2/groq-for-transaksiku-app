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

```json
{
  "message": "Beli nasi goreng 15rb tadi siang"
}
```

#### Respons (Sukses - 200)

```json
{
  "success": true,
  "data": {
    "nama": "Nasi Goreng",
    "jumlah": 15000,
    "jenis": "pengeluaran",
    "tanggal": "2024-12-18"
  }
}
```

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

  /// Ekstrak data transaksi dari teks
  static Future<Map<String, dynamic>?> extractTransaction(String text) async {
    final url = Uri.parse("$baseUrl/chat");
    try {
      final response = await http.post(
        url,
        headers: _headers,
        body: jsonEncode({"message": text}),
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
  // Tes Ekstraksi
  final transaction = await GroqService.extractTransaction("Beli bensin 20rb");
  print("Hasil Ekstraksi: $transaction");
  // Output: {nama: Bensin, jumlah: 20000, jenis: pengeluaran, ...}

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

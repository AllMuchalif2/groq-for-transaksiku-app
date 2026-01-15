const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// --- PROMPT 1: Mode Ekstraksi (Input Transaksi) ---
const getExtractionPrompt = () => {
  const today = new Date().toISOString().split("T")[0];
  return `
    You are an intelligent data extraction assistant for "Transaksiku".
    Current Date: ${today}

    Rules:
    1. Output MUST be valid JSON only.
    2. JSON Structure:
       - "nama": (string) Title.
       - "jumlah": (integer) Amount in numeric IDR.
       - "jenis": (string) "pemasukan" or "pengeluaran".
       - "tanggal": (string) YYYY-MM-DD.
    
    Example Input: "Beli nasi 15rb"
    Example Output: { "nama": "Nasi", "jumlah": 15000, "jenis": "pengeluaran", "tanggal": "${today}" }
    `;
};

// --- PROMPT 2: Mode Konsultan (Chat & Review) ---
const getConsultantPrompt = (transactions) => {
  const today = new Date().toISOString().split("T")[0];
  // Batasi context agar tidak terlalu besar (ambil 20 terakhir misal)
  const limitedTransactions = transactions ? transactions.slice(0, 20) : [];
  const transactionData = JSON.stringify(limitedTransactions, null, 2);

  return `
    You are a financial consultant for "Transaksiku". 
    Current Date: ${today}
    
    User Transaction History:
    ${transactionData}

    Instructions:
    1. Answer the user's question based on their financial data.
    2. If they input generic chat, reply normally but strictly related to finance/motivation.
    3. Language: Indonesian (Bahasa Indonesia).
    4. Keep it concise, friendly, and helpful.
    `;
};

const botHandler = async (req, res) => {
  try {
    const { message, transactions } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    // LOGIKA UTAMA: Cek apakah user ingin input data atau curhat
    const isInputMode = message.trim().toLowerCase().startsWith("/input");

    let systemPrompt = "";
    let userMessage = message;
    let modelName = "llama-3.3-70b-versatile";
    let jsonMode = false;

    if (isInputMode) {
      // --- MODE INPUT TRANSAKSI ---
      // Hapus kata "/input" dari pesan agar AI fokus ke datanya
      userMessage = message.replace(/^\/input\s+/i, ""); 
      systemPrompt = getExtractionPrompt();
      jsonMode = true; // Paksa output JSON
    } else {
      // --- MODE KONSULTAN KEUANGAN ---
      systemPrompt = getConsultantPrompt(transactions || []);
      jsonMode = false; // Output teks biasa
    }

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      model: modelName,
      temperature: isInputMode ? 0.1 : 0.6, // Suhu rendah utk data, sedang utk chat
      response_format: jsonMode ? { type: "json_object" } : undefined,
    });

    const aiContent = completion.choices[0]?.message?.content;

    // KEMBALIKAN RESPONS TERSTRUKTUR KE FLUTTER
    if (isInputMode) {
      // Jika Input Mode, parse JSON-nya
      try {
        const parsedData = JSON.parse(aiContent);
        return res.status(200).json({
          success: true,
          data: {
            type: "transaction_created", // Flag untuk Flutter
            message: "Berhasil mengekstrak data transaksi.",
            result: parsedData
          }
        });
      } catch (e) {
        return res.status(422).json({ success: false, message: "Gagal parsing JSON dari AI." });
      }
    } else {
      // Jika Chat Mode, kembalikan teks
      return res.status(200).json({
        success: true,
        data: {
          type: "chat_reply", // Flag untuk Flutter
          message: aiContent,
          result: null
        }
      });
    }

  } catch (error) {
    console.error("Groq Bot Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

module.exports = { botHandler };
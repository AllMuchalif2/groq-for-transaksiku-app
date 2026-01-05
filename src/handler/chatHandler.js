const Groq = require("groq-sdk");
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});
const getSystemPrompt = (kategori = [], saldo = [], tabungan = []) => {
  const today = new Date().toISOString().split("T")[0];
  const kategoriList =
    kategori.length > 0
      ? kategori
          .map((k) => `ID ${k.kategori_id}: ${k.nama} (${k.tipe})`)
          .join(", ")
      : "No categories available";
  const saldoList =
    saldo.length > 0
      ? saldo.map((s) => `ID ${s.saldo_id}: ${s.nama}`).join(", ")
      : "No balance accounts available";

  const tabunganList =
    tabungan.length > 0
      ? tabungan.map((t) => `ID ${t.tabungan_id}: ${t.nama}`).join(", ")
      : "No savings accounts available";

  return `
    You are an intelligent data extraction assistant for an Expense Tracker app called "Saku Cerdas".
    Your task is to extract transaction details from Indonesian natural language text into strict JSON.

    Current Date Reference: ${today}

    Available Categories: ${kategoriList}
    Available Balance Accounts: ${saldoList}
    Available Savings Accounts: ${tabunganList}

    Rules:
    1. Output MUST be valid JSON only. No markdown, no explanations.
    2. JSON Structure:
       - "nama": (string) Brief title of transaction.
       - "jumlah": (integer) Amount in numeric IDR. Convert "rb", "ribu" to 000, "jt" to 000000.
       - "tanggal": (string) ISO8601 Date (YYYY-MM-DD). If not specified, use Current Date Reference. Handle "kemarin" (yesterday) or "besok" (tomorrow) relative to Current Date.
       - "kategori_id": (integer) Select the most appropriate category ID from Available Categories based on context AND transaction type (PEMASUKAN/PENGELUARAN).
       - "saldo_id": (integer) Select balance account ID. Default to the first available ID unless specifically mentioned (e.g., "dari gopay", "pakai BCA").
       - "tabungan_id": (integer or null) Select savings account ID ONLY if explicitly mentioned in text (e.g., "ke tabungan liburan"). Otherwise, set to null.

    Selection Guidelines:
    - For "kategori_id": Match both the context (e.g., "nasi" → food category) AND the transaction type (expense keywords: beli, bayar, jajan, makan, ongkos; income keywords: gajian, dapat uang, dikasih, jual).
    - For "saldo_id": Default to first ID if not mentioned. If mentioned (e.g., "gopay", "cash", "rekening"), select matching ID.
    - For "tabungan_id": Only set if savings is explicitly mentioned, otherwise null.

    Example Input: "Beli nasi goreng 15rb"
    Example Output: { "nama": "Nasi Goreng", "jumlah": 15000, "tanggal": "${today}", "kategori_id": 1, "saldo_id": 1, "tabungan_id": null }
    `;
};

const chatHandler = async (req, res) => {
  try {
    const { message, kategori = [], saldo = [], tabungan = [] } = req.body;

    if (!message) {
      return res
        .status(400)
        .json({ success: false, message: "Message field is required" });
    }

    if (
      !Array.isArray(kategori) ||
      !Array.isArray(saldo) ||
      !Array.isArray(tabungan)
    ) {
      return res
        .status(400)
        .json({
        success: false,
        message: "kategori, saldo, and tabungan must be arrays",
      });
    }

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: getSystemPrompt(kategori, saldo, tabungan) },
        { role: "user", content: message },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      response_format: { type: "json_object" },
    });

    const aiContent = completion.choices[0]?.message?.content;

    const parsedData = JSON.parse(aiContent);

    return res.status(200).json({
      success: true,
      data: parsedData,
    });
  } catch (error) {
    console.error("Groq API Error:", error);
    const errorMessage = error?.error?.message || error.message;
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: errorMessage,
    });
  }
};

module.exports = { chatHandler };

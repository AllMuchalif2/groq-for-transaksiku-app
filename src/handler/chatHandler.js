const Groq = require("groq-sdk");

// Initialize Groq client
// Ensure dotenv is loaded in the entry point (server.js), so process.env is available here.
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// System Prompt Engineering
const getSystemPrompt = () => {
  const today = new Date().toISOString().split("T")[0];
  return `
    You are an intelligent data extraction assistant for an Expense Tracker app called "Transaksiku".
    Your task is to extract transaction details from Indonesian natural language text into strict JSON.

    Current Date Reference: ${today}

    Rules:
    1. Output MUST be valid JSON only. No markdown, no explanations.
    2. JSON Structure:
       - "nama": (string) Brief title of transaction.
       - "jumlah": (integer) Amount in numeric IDR. Convert "rb", "ribu" to 000, "jt" to 000000.
       - "jenis": (string) Either "pemasukan" (income) or "pengeluaran" (expense).
         - Keywords for "pemasukan": gajian, dapat uang, dikasih, jual.
         - Keywords for "pengeluaran": beli, bayar, jajan, makan, ongkos.
       - "tanggal": (string) ISO8601 Date (YYYY-MM-DD). If not specified in text, use the Current Date Reference. handle "kemarin" (yesterday) or "besok" (tomorrow) relative to Current Date.

    Example Input: "Beli nasi goreng 15rb tadi siang"
    Example Output: { "nama": "Nasi Goreng", "jumlah": 15000, "jenis": "pengeluaran", "tanggal": "${today}" }
    `;
};

const chatHandler = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res
        .status(400)
        .json({ success: false, message: "Message field is required" });
    }

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: getSystemPrompt() },
        { role: "user", content: message },
      ],
      // Using the latest supported model as per previous code
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
    // Display clearer error message from Groq if available
    const errorMessage = error?.error?.message || error.message;
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: errorMessage,
    });
  }
};

module.exports = { chatHandler };

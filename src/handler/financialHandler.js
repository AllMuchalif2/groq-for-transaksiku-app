const Groq = require("groq-sdk");

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// System Prompt Engineering for Financial Insight
const getFinancialSystemPrompt = (transactions) => {
  const today = new Date().toISOString().split("T")[0];
  const transactionData = JSON.stringify(transactions, null, 2);

  return `
    You are a financial analyst assistant for an application called "Transaksiku".
    Your goal is to provide a helpful, friendly, and concise analysis of the user's recent financial activity.

    Current Date: ${today}

    Context Data (Last 10 Transactions):
    ${transactionData}

    Instructions:
    1. Analyze the provided transactions to answer the user's specific question.
    2. If the user asks generally (e.g., "How's my finance?"), summarize key spending categories and total expenses vs income.
    3. Be specific: mention specific amounts and categories.
    4. Tone: Friendly, encouraging, but realistic. Warn if spending is high.
    5. Language: Indonesian (Bahasa Indonesia).
    6. Keep the answer relatively short (max 2-3 paragraphs).

    Disclaimer: You are an AI, provide insights based ONLY on the data provided.
    `;
};

const financialInsightHandler = async (req, res) => {
  try {
    const { message, transactions } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message field is required",
      });
    }

    if (
      !transactions ||
      !Array.isArray(transactions) ||
      transactions.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Transactions array is required and must not be empty.",
      });
    }

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: getFinancialSystemPrompt(transactions) },
        { role: "user", content: message },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
    });

    const aiResponse = completion.choices[0]?.message?.content;

    return res.status(200).json({
      success: true,
      data: {
        analysis: aiResponse,
      },
    });
  } catch (error) {
    console.error("Groq Financial Insight API Error:", error);
    const errorMessage = error?.error?.message || error.message;
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: errorMessage,
    });
  }
};

module.exports = { financialInsightHandler };

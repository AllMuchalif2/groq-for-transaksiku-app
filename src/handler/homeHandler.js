const getDocumentationHtml = () => {
  return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Transaksiku AI Backend</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.6; color: #333; }
        h1 { color: #2563eb; }
        code { background: #f1f5f9; padding: 2px 5px; border-radius: 4px; font-family: monospace; }
        .card { border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin-top: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .btn { display: inline-block; background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 500; margin-top: 10px; }
        .btn:hover { background: #1d4ed8; }
      </style>
    </head>
    <body>
      <h1>Transaksiku AI Backend</h1>
      <p>Layanan API Backend untuk aplikasi Transaksiku, ditenagai oleh <strong>Groq AI</strong>.</p>
      
      <div class="card">
        <h2>Status Server</h2>
        <p>Server Berjalan Normal</p>
        <p>Endpoint: <code>POST /api/bot</code></p>
      </div>

      <div class="card">
        <h2>Dokumentasi & Integrasi</h2>
        <p>Silakan merujuk ke repository untuk dokumentasi lengkap dan cara penggunaan.</p>
        <a href="https://github.com/AllMuchalif2/groq-for-transaksiku-app" class="btn">Lihat Dokumentasi Backend</a>
        <br><br>
        <p>Repository Aplikasi Frontend (Flutter):</p>
        <a href="https://github.com/AllMuchalif2/transaksiku-app/" style="color: #2563eb; text-decoration: none;">Transaksiku App (Flutter)</a>
      </div>
      
      <p style="margin-top: 40px; color: #64748b; font-size: 0.9em;">&copy; ${new Date().getFullYear()} AllMuchalif2</p>
    </body>
    </html>
  `;
};

const homeHandler = (req, res) => {
  res.send(getDocumentationHtml());
};

module.exports = { homeHandler };

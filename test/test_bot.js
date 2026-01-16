const http = require("http");
require("dotenv").config();

const APP_SECRET = process.env.APP_SECRET || "u-didnt-even-know";

// Helper function to send request
function sendTestRequest(label, payload) {
  const postData = JSON.stringify(payload);

  const options = {
    hostname: "localhost",
    port: 3000,
    path: "/api/bot",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData),
      "x-app-secret": APP_SECRET,
    },
  };

  console.log(`\n▶ Testing: ${label}`);
  console.log("Payload:", postData);

  const req = http.request(options, (res) => {
    let data = "";
    res.on("data", (chunk) => {
      data += chunk;
    });
    res.on("end", () => {
      console.log(`Status: ${res.statusCode}`);
      try {
        const json = JSON.parse(data);
        console.log("Response:", JSON.stringify(json, null, 2));
      } catch (e) {
        console.log("Raw Response:", data);
      }
    });
  });

  req.on("error", (e) => console.error(`Error ${label}:`, e.message));
  req.write(postData);
  req.end();
}

console.log("Starting tests... Make sure the server is running on port 3000!");

// Case 1: Chat Mode
setTimeout(() => {
  sendTestRequest("Chat Mode", {
    message: "Bagaimana cara menabung?",
    transactions: [],
  });
}, 1000);

// Case 2: Input Mode
setTimeout(() => {
  sendTestRequest("Input Mode", {
    message: "/input Beli nasi goreng 15rb",
    transactions: [],
  });
}, 5000); // 5s delay to allow time for the first request

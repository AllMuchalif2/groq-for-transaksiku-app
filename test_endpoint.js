require("dotenv").config();
const http = require("http");

const data = JSON.stringify({
  message: "Minggu ini keuanganku gimana?",
  transactions: [
    {
      date: "2025-12-10",
      amount: 50000,
      category: "Food",
      description: "Nasi Goreng",
    },
    {
      date: "2025-12-11",
      amount: 25000,
      category: "Transport",
      description: "Gojek",
    },
    {
      date: "2025-12-12",
      amount: 100000,
      category: "Entertainment",
      description: "Bioskop",
    },
  ],
});

const options = {
  hostname: "localhost",
  port: 3000,
  path: "/api/financial-insight",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-app-secret": process.env.APP_SECRET,
    "Content-Length": data.length,
  },
};

console.log("Sending request to /api/financial-insight...");

const req = http.request(options, (res) => {
  console.log(`StatusCode: ${res.statusCode}`);

  let responseData = "";

  res.on("data", (chunk) => {
    responseData += chunk;
  });

  res.on("end", () => {
    console.log("Response Body:");
    console.log(responseData);
  });
});

req.on("error", (error) => {
  console.error(error);
});

req.write(data);
req.end();

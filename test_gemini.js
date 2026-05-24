const fs = require('fs');

const envFile = fs.readFileSync('.env', 'utf8');
const apiKeyLine = envFile.split('\n').find(line => line.startsWith('GEMINI_API_KEY='));
const apiKey = apiKeyLine ? apiKeyLine.split('=')[1].trim() : null;

if (!apiKey) {
  console.log("No API Key found in .env");
  process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ parts: [{ text: "Hello, test." }] }]
  })
})
.then(async res => {
  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Response:", text);
})
.catch(err => {
  console.error("Fetch failed:", err);
});

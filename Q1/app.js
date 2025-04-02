const express = require("express");
const app = express();
const PORT = 3000;

const winSize = 10;
let numsWin = [];
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQzNjAzNDg2LCJpYXQiOjE3NDM2MDMxODYsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjAwZGFkNzYwLWY1MDQtNDY1YS1iODgxLTgzYzk2MTFlNGQzNiIsInN1YiI6InNvdXJhdnBhcmlkYTE3MEBnbWFpbC5jb20ifSwiZW1haWwiOiJzb3VyYXZwYXJpZGExNzBAZ21haWwuY29tIiwibmFtZSI6InNvdXJhdiBwYXJpZGEiLCJyb2xsTm8iOiIyMjA1MTAzMiIsImFjY2Vzc0NvZGUiOiJud3B3cloiLCJjbGllbnRJRCI6IjAwZGFkNzYwLWY1MDQtNDY1YS1iODgxLTgzYzk2MTFlNGQzNiIsImNsaWVudFNlY3JldCI6ImhURmVRTVllblNYY0NGeEcifQ.whsWxCGz0qp9XSxQcTfo8wJv5ko4DsEZq2j9-nNTAxI";


const idMap = {
  "p": "primes",
  "f": "fibo",
  "e": "even",
  "r": "rand"
};

// Fetch numbers from external API
const getNums = async (type) => {
  const opts = {
    hostname: "20.244.56.144",
    path: `/evaluation-service/${idMap[type] || type}`,
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  };

  return new Promise(resolve => {
    const req = https.request(opts, res => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try { resolve(JSON.parse(data).numbers || []); } 
        catch { resolve([]); }
      });
    });

    req.on("error", () => resolve([]));
    req.setTimeout(500, () => req.destroy() || resolve([]));
    req.end();
  });
};

// Check valid number ID
const checkId = (req, res, next) => {
  const id = req.params.numberid;
  if (!idMap[id]) return res.status(400).json({ error: "Invalid ID" });
  next();
};

// Main number processing endpoint
app.get("/numbers/:numberid", checkId, async (req, res) => {
  const id = req.params.numberid;
  const prev = [...numsWin];
  
  const nums = await getNums(id);
  if (nums.length) {
    numsWin = [...new Set([...numsWin, ...nums])].slice(-winSize);
  }

  const avg = numsWin.length 
    ? Number((numsWin.reduce((s, n) => s + n, 0) / numsWin.length).toFixed(2))
    : 0;

  res.json({
    windowPrevstate: prev,
    windowCurrState: numsWin,
    numbers: nums,
    avg: avg
  });
});

app.get("/", (req, res) => res.send("Hello World!"));
app.listen(PORT, () => console.log(`Running on http://localhost:${PORT}`));
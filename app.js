const express = require("express");
const app = express();
const http = require("http");
const PORT = 3000;

const WINDOW_SIZE = 10;
let numberWindow = [];
const BEARER_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQzNjAzODM0LCJpYXQiOjE3NDM2MDM1MzQsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjAwZGFkNzYwLWY1MDQtNDY1YS1iODgxLTgzYzk2MTFlNGQzNiIsInN1YiI6InNvdXJhdnBhcmlkYTE3MEBnbWFpbC5jb20ifSwiZW1haWwiOiJzb3VyYXZwYXJpZGExNzBAZ21haWwuY29tIiwibmFtZSI6InNvdXJhdiBwYXJpZGEiLCJyb2xsTm8iOiIyMjA1MTAzMiIsImFjY2Vzc0NvZGUiOiJud3B3cloiLCJjbGllbnRJRCI6IjAwZGFkNzYwLWY1MDQtNDY1YS1iODgxLTgzYzk2MTFlNGQzNiIsImNsaWVudFNlY3JldCI6ImhURmVRTVllblNYY0NGeEcifQ.cbgCYHPBZGQU8UfWvnNYmsLmXOFU3YN0OjXHvfRSSG8"; // Replace with actual token



app.get("/", (req, res) => {
    res.send("Hello World!");
});

// Mapping of number IDs to API types
const numberIdMap = {
    "p": "primes",
    "f": "fibo",
    "e": "even",
    "r": "rand"
};

// Fetch numbers from the third-party API
const fetchNumbers = async (type) => {
    const mappedType = numberIdMap[type] || type;
    const options = {
        hostname: "20.244.56.144",
        path: `/evaluation-service/${mappedType}`,  // Fixed string formatting
        method: "GET",
        headers: {
            "Authorization": `Bearer ${BEARER_TOKEN}`, // Fixed template literal
            "Content-Type": "application/json"
        }
    };

    return new Promise((resolve) => {
        const req = https.request(options, (res) => {
            let data = "";
            res.on("data", (chunk) => { data += chunk; });
            res.on("end", () => {
                try {
                    const parsedData = JSON.parse(data);
                    resolve(parsedData.numbers || []);
                } catch (error) {
                    resolve([]);
                }
            });
        });

        req.on("error", () => resolve([]));
        req.setTimeout(500, () => {
            req.destroy();
            resolve([]);
        });
        req.end();
    });
};

// Middleware to validate numberid
const validateNumberId = (req, res, next) => {
    if (!numberIdMap.hasOwnProperty(req.params.numberid)) {
        return res.status(400).json({ error: "Invalid number ID" });
    }
    next();
};

app.get("/numbers/:numberid", validateNumberId, async (req, res) => {
    const { numberid } = req.params;
    const prevState = [...numberWindow];
    
    const numbers = await fetchNumbers(numberid);
    if (numbers.length > 0) {
        numberWindow = [...new Set([...numberWindow, ...numbers])].slice(-WINDOW_SIZE);
    }

    const avg = numberWindow.length ? (numberWindow.reduce((sum, num) => sum + num, 0) / numberWindow.length).toFixed(2) : 0;

    res.json({
        windowPrevstate: prevState,
        windowCurrState: [...numberWindow],
        numbers,
        avg: parseFloat(avg)
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);  // Fixed string interpolation
});

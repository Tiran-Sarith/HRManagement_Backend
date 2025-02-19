const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const express = require('express');
const router = express.Router();

async function extractTextFromPDF(pdfPath) {
    try {
        const absolutePath = path.resolve(pdfPath);

        if (!fs.existsSync(absolutePath)) {
            throw new Error(`File not found: ${absolutePath}`);
        }

        const dataBuffer = fs.readFileSync(absolutePath);
        const data = await pdfParse(dataBuffer);
        return data.text;
    } catch (error) {
        console.error("Error extracting text from PDF:", error.message);
        return null;
    }
}

// ✅ Correctly define the GET route
router.get('/extract-text', async (req, res) => {
    try {
        const pdfPath = './files/Tiran.pdf'; // Replace with your actual PDF path
        const text = await extractTextFromPDF(pdfPath);

        if (text) {
            res.json({ extractedText: text });
        } else {
            res.status(500).json({ error: "Failed to extract text." });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

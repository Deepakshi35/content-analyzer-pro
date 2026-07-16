import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
// Serve the frontend files from the "public" directory
app.use(express.static('public'));

// Initialize the official Google Gen AI SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// 1. STANDARD ANALYSIS ROUTE
app.post('/api/analyze', async (req, res) => {
    try {
        const { content } = req.body;
        
        const prompt = `Analyze the following text and provide a JSON response containing exactly these four keys:
        1. "tags": An array of 3 to 5 relevant SEO or categorization tags.
        2. "category": A short string representing the main category of the content.
        3. "engagementScore": An integer from 1 to 100 predicting how engaging this content is.
        4. "tips": An array of exactly 2 string sentences giving actionable tips to improve engagement.
        
        Content to analyze:
        "${content}"`;

        const response = await ai.models.generateContent({
            // UPDATED: Using the correct, available 1.5 Flash model
            model: 'gemini-3.1-flash-lite',
            contents: prompt,
            config: {
                // Forcing JSON output prevents the AI from wrapping the response in markdown
                responseMimeType: "application/json",
            }
        });

        const result = JSON.parse(response.text);
        res.json(result);
    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ error: 'Failed to analyze content.' });
    }
});

// 2. DETERMINISTIC FLASH ROUTE (For Tagging & Extraction)
app.post('/api/tags', async (req, res) => {
    try {
        const response = await ai.models.generateContent({
            // UPDATED
            model: 'gemini-1.5-flash',
            contents: `Extract keywords from: ${req.body.text}`,
            config: {
                temperature: 0.1, // Near-zero variance for strict extraction
                responseMimeType: "application/json"
            }
        });
        res.json(JSON.parse(response.text));
    } catch (error) {
        console.error("Tags API Error:", error);
        res.status(500).json({ error: 'Failed to extract tags.' });
    }
});

// 3. CREATIVE FLASH ROUTE (For Content Improvement/Rewrites)
app.post('/api/rewrite', async (req, res) => {
    try {
        const response = await ai.models.generateContent({
            // UPDATED
            model: 'gemini-1.5-flash',
            contents: `Rewrite this to be highly engaging for LinkedIn: ${req.body.text}`,
            config: {
                temperature: 0.7, // Higher temperature gives the model room to be creative
                maxOutputTokens: 1000
            }
        });
        res.json({ rewrite: response.text });
    } catch (error) {
        console.error("Rewrite API Error:", error);
        res.status(500).json({ error: 'Failed to rewrite content.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running! Open http://localhost:${PORT} in your browser.`);
});
import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';


dotenv.config();
const app = express();
app.use(express.json());

app.post('/evaluate-cv', async (req, res) => {
    const { jobDescription, text } = req.body;

    // Constructing a dynamic prompt based on the job description
    const prompt = `
        You are an HR assistant that evaluates candidate CVs based on job descriptions.
        Consider the following criteria:
        1. **Skills Matching** – Check if the CV mentions required skills.
        2. **Experience Relevance** – Evaluate if the candidate has relevant work experience.
        3. **Education & Certifications** – Ensure required qualifications are met.
        4. **Projects & Achievements** – Look for key projects, awards, or leadership roles.
        5. **Overall Compatibility Score** – Provide a score from 0-100 with an explanation.

        **Job Description:** 
        ${jobDescription}

        **Candidate's CV:** 
        ${text}

        Provide a **detailed breakdown** for each criterion and a **final compatibility score**.
    `;

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-4",
            messages: [{ role: "user", content: prompt }]
        }, {
            headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` }
        });

        res.json({ evaluation: response.data.choices[0].message.content });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error processing CV evaluation" });
    }
});

app.listen(3000, () => console.log("Server running on port 3000"));

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
        You are an advanced HR assistant specializing in evaluating CVs based on job descriptions. Your task is to analyze the candidate’s CV and provide an Overall Compatibility Score by checking the compatibility with the job based on evaluating criteria and fixed weightage.  

### **Evaluation Criteria & Weightage**
1. **Skills Matching (30%)**  
   - Extract skills from the job description and compare them with those found in the CV.  
   - **Scoring Logic:**  
     - Full match: 30 points per required skill  
     - Partial match: 15 points  
     - Missing skill: 0 points  
   - Normalize the total skill score to a **300-point scale**.

2. **Experience Relevance (25%)**  
   - Extract job roles and calculate years of relevant experience.  
   - **Scoring Logic:**  
     - Meets or exceeds required years: Full 250 points  
     - 75% - 99% of required years: 200 points  
     - 50% - 74%: 125 points  
     - Below 50%: 50 points  
   - Normalize the score to a **250-point scale**.

3. **Education & Certifications (20%)**  
   - Identify degrees and certifications in both the job description and CV.  
   - **Scoring Logic:**  
     - Fully matches required education and certifications: 200 points  
     - Lacks one key qualification: 100 points  
     - Missing critical requirements: 0 points  

4. **Projects & Achievements (20%)**  
   - Identify key projects, leadership roles, and awards relevant to the job.  
   - **Scoring Logic:**  
     - Strong relevant projects and leadership: 200 points  
     - Somewhat relevant projects: 100 points  
     - No relevant projects: 0 points  

5. **Resume Structure & Clarity (5%)**  
   - Assess formatting, readability, and completeness.  
   - Deduct points for **missing sections, excessive length (>5 pages), or poor formatting**.  
   - **Scoring Logic:**  
     - Well-structured, readable resume: 50 points  
     - Minor issues: 25 points  
     - Major readability issues: 0 points  

---

### **Processing Instructions**
1. **Extract job requirements (skills, experience, education, projects).**
2. **Extract candidate’s qualifications, experience, skills, and projects.**
3. **Score each section using the predefined scoring logic.**
4. **Calculate the final compatibility score** as the sum of all section scores.
5. **Return ONLY the final score in JSON format.**


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

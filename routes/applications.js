const express = require('express');
let application = require('../models/application_model');
const router = express.Router();
const app = express();
app.use(express.json());
router.use("/files", express.static("files"));

const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const multer = require('multer');
const { default: mongoose } = require('mongoose');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./files")
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now()
    cb(null, uniqueSuffix + file.originalname)
  }
});

const upload = multer({ storage: storage });

router.post("/upload-files", upload.single("file"), async (req, res) => {
  const { name, email, portfolio, introduction } = req.body;
  const phoneNo = req.body.hireType;
  const filename = req.file.filename;
  const jobTitle = req.file.jobTitle;

  try {
    await application.create({ name, email, portfolio, phoneNo, introduction, filename, jobTitle });
    res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});

async function extractTextFromPDF(pdfPath) {
  try {
    const absolutePath = path.resolve(pdfPath);
    if (!fs.existsSync(absolutePath)) throw new Error(`File not found: ${absolutePath}`);
    const dataBuffer = fs.readFileSync(absolutePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error("Error extracting text from PDF:", error.message);
    return null;
  }
}

// Add Application with CV Evaluation and Questions
router.route("/Aadd").post(upload.single("file"), async (req, res) => {
  const { name, email, portfolio, phoneNo, introduction, jobTitle, vacancyId, jobRequirements } = req.body;
  const filename = req.file.filename;
  const pdfPath = req.file.path;

  const newApplication = new application({
    name,
    email,
    portfolio,
    phoneNo,
    introduction,
    filename,
    jobTitle,
    vacancyId,
    cvScore: null,
    questionAnswers: [],
  });

  const savedApplication = await newApplication.save();
  console.log("Application added with ID:", savedApplication._id);

  try {
    const text = await extractTextFromPDF(pdfPath);

    if (text) {
      const prompt = `
You are an HR assistant that evaluates candidate CVs based on job descriptions.
You have two tasks:
1. Evaluate the CV and give a score (0–1000) based on:
   - Skills Matching
   - Experience Relevance
   - Education & Certifications
   - Projects & Achievements
2. Generate 5 relevant technical or behavioral interview questions based on the CV and job description.

**Job Description:**  
${jobRequirements}

**Candidate's CV:**  
${text}

**Response Format:**  
Return only a JSON object in the following format:
{
  "score": <numerical_score>,
  "questions": ["question1", "question2", "question3", "question4", "question5"]
}
`;

      const response = await axios.post('https://api.openai.com/v1/chat/completions',
        {
          model: "gpt-4",
          messages: [{ role: "user", content: prompt }]
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          }
        });

      const evaluationResult = JSON.parse(response.data.choices[0].message.content);
      const cvScore = evaluationResult.score;
      const questions = evaluationResult.questions;

      console.log("CV Evaluation Score:", cvScore);
      console.log("Generated Questions:", questions);

      await application.findByIdAndUpdate(savedApplication._id, {
        cvScore,
        questionAnswers: questions.map(q => ({ question: q, answer: "" }))
      });

      console.log("Application updated with CV score and generated questions");
      res.json({ evaluation: evaluationResult });
    } else {
      res.status(500).json({ error: "Failed to extract text." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error processing CV evaluation" });
  }
});

// View all applications
router.route("/Aview").get((req, res) => {
  application.find().then(applications => res.json(applications)).catch(err => console.log(err));
});

// View application by ID
router.route("/Aview/:id").get((req, res) => {
  application.findById(req.params.id).then(application => res.json(application)).catch(err => console.log(err));
});

// View applications by Vacancy ID
router.route("/Aview/byVacancy/:vacancyId").get(async (req, res) => {
  try {
    const applications = await application.find({ vacancyId: req.params.vacancyId });
    if (!applications || applications.length === 0) {
      return res.status(404).json({ message: "No applications found for this vacancy ID" });
    }
    res.json(applications);
  } catch (err) {
    console.error("Error fetching applications:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Endpoint to receive and update answers
router.route("/Aanswer/:id").post(async (req, res) => {
  const { answers } = req.body; // expecting [{question, answer}, ...]

  try {
    const updatedApp = await application.findByIdAndUpdate(req.params.id, {
      questionAnswers: answers
    }, { new: true });

    if (!updatedApp) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json({ message: "Answers submitted successfully", updatedApp });
  } catch (err) {
    console.error("Error submitting answers:", err);
    res.status(500).json({ error: "Failed to submit answers" });
  }
});


// Delete a specific application
router.route("/Adelete/:id").delete(async (req, res) => {
  try {
    const id = req.params.id;
    
    // First check if the application exists
    const applicationToDelete = await application.findById(id);
    
    if (!applicationToDelete) {
      return res.status(404).json({ message: "Application not found" });
    }
    
    // If there's a file associated with the application, delete it
    if (applicationToDelete.filename) {
      const filePath = path.join(__dirname, '../files', applicationToDelete.filename);
      
      // Check if file exists before attempting to delete
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); // Delete the file
        console.log(`Deleted file: ${applicationToDelete.filename}`);
      }
    }
    
    // Now delete the application record
    const deletedApplication = await application.findByIdAndDelete(id);
    
    if (!deletedApplication) {
      return res.status(404).json({ message: "Application not found" });
    }
    
    res.status(200).json({ 
      message: "Application successfully deleted",
      deletedApplication
    });
    
  } catch (err) {
    console.error("Error deleting application:", err);
    res.status(500).json({ 
      message: "Error deleting application", 
      error: err.message 
    });
  }
});

module.exports = router;

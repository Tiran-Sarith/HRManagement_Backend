const express = require('express');
let application = require('../models/application_model');
const router = express.Router();
const app = express();
app.use(express.json());
router.use("/files", express.static("files"));

const upload = require("../s3Uploader"); // updated multer
const stream = require("stream");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../s3config");


const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const multer = require('multer');
const { default: mongoose } = require('mongoose');

// File upload config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./files")
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now()
    cb(null, uniqueSuffix + file.originalname)
  }
});

//const upload = multer({ storage: storage });
require('../models/application_model');
// const upload = multer({ storage: storage })



router.post("/upload-files", upload.single("file"), async(req, res) => {
  console.log(req.file);
  const name = req.body.name;
    const email = req.body.email;
    const portfolio = req.body.portfolio;
    const phoneNo = req.body.hireType;
    const introduction= req.body.introduction;
    const filename = req.file.filename;
    const jobTitle = req.file.jobTitle;

    try{
        await Application.create({ name: name, email:email, portfolio: portfolio, phoneNo: phoneNo, introduction:introduction, filename: filename, jobTitle: jobTitle  });
        res.send({status: "ok"});
    }catch(error){
        res.json({status:error})
    }
});

// Extract PDF text
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

// Add application with CV evaluation and questions
router.post("/Aadd", upload.single("file"), async (req, res) => {
  const { name, email, portfolio, phoneNo, introduction, jobTitle, vacancyId, jobRequirements } = req.body;
  const filename = req.file.filename;
  const pdfPath = req.file.path;
  
  const fileKey = req.file.key; // S3 key
  const bucketName = process.env.S3_BUCKET_NAME;


  const newApplication = new application({
    name,
    email,
    portfolio,
    phoneNo,
    introduction,
    filename: fileKey,
    jobTitle,
    vacancyId,
    cvScore: null,
    questions: [],
    answers: []
  });

  const savedApplication = await newApplication.save();
  console.log("Application added with ID:", savedApplication._id);
   console.log("Application filename:", savedApplication.filename);

          // Step 1: Download PDF from S3
    const { GetObjectCommand } = require("@aws-sdk/client-s3");

    const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: fileKey
    });

    const response2 = await s3.send(command);
    const pdfStream = response2.Body;
  
  
        // Step 2: Convert stream to buffer
        const buffer = await streamToBuffer(pdfStream);

   // Step 3: Extract text from PDF
        const data = await pdfParse(buffer);

  try {
    const extractedText = data.text;

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
${extractedText}

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
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
             "Content-Type": "application/json"

          }
        });

      const evaluationResult = JSON.parse(response.data.choices[0].message.content);
      const cvScore = evaluationResult.score;
      const questions = evaluationResult.questions;

      console.log("CV Evaluation Score:", cvScore);
      console.log("Generated Questions:", questions);

      await application.findByIdAndUpdate(savedApplication._id, {
        cvScore,
        questions,
        answers: Array(questions.length).fill("")
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

function streamToBuffer(readStream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        readStream.on("data", chunk => chunks.push(chunk));
        readStream.on("end", () => resolve(Buffer.concat(chunks)));
        readStream.on("error", reject);
    });
}


// GET all applications
router.get("/Aview", async (req, res) => {
  try {
    const applications = await application.find();
    res.json(applications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET application by ID
router.get("/Aview/:id", async (req, res) => {
  try {
    const appData = await application.findById(req.params.id);
    if (!appData) {
      return res.status(404).json({ message: "Application not found" });
    }
    res.json(appData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET applications by Vacancy ID
router.get("/Aview/byVacancy/:vacancyId", async (req, res) => {
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


// GET specific questions for an application
router.get("/Aquestions/:id", async (req, res) => {
  try {
    const appData = await application.findById(req.params.id);
    if (!appData) {
      return res.status(404).json({ message: "Application not found" });
    }
    res.json({ questions: appData.questions });
  } catch (err) {
    console.error("Error fetching questions:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST answers for an application
router.post("/AsubmitAnswers/:id", async (req, res) => {
  const { answers } = req.body; // expecting array of strings

  try {
    const appData = await application.findById(req.params.id);
    if (!appData) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (!Array.isArray(answers) || answers.length !== appData.questions.length) {
      return res.status(400).json({ message: "Number of answers must match the number of questions." });
    }
        appData.answers = answers;
    await appData.save();

    res.json({ message: "Answers submitted successfully", updated: true });
  } catch (err) {
    console.error("Error submitting answers:", err);
    res.status(500).json({ error: "Failed to submit answers" });
  }
});



// GET only the answers of a specific application
router.route("/Aanswers/:id").get(async (req, res) => {
  try {
    const app = await application.findById(req.params.id);
    if (!app) {
      return res.status(404).json({ message: "Application not found" });
    }
    res.json({ answers: app.answers });
  } catch (err) {
    console.error("Error fetching answers:", err);
    res.status(500).json({ error: "Internal Server Error" });
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

const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

router.get("/get-s3-cv-url/:filename", async (req, res) => {
    try {
        const { filename } = req.params;

        const command = new GetObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: filename,
        });

        const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 }); // 1 hour

        res.json({ url: signedUrl });
    } catch (err) {
        console.error("Error generating signed URL:", err);
        res.status(500).json({ error: "Failed to generate signed URL" });
    }
});



module.exports = router;

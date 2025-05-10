const express = require('express');
let application = require('../models/application_model');
const router = express.Router();
const app = express();
app.use(express.json());
router.use("/files", express.static("files"));
/////////////////
const upload = require("../s3Uploader"); // updated multer
const stream = require("stream");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../s3config");



const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
// const express = require('express');
// const router = express.Router();


/////chat gpt ////

const axios = require('axios');  // For making HTTP requests
const dotenv = require('dotenv'); // For loading environment variables

dotenv.config(); // Load environment variables from .env file


////Chat GPT integration process //////////




//multer
const multer  = require('multer');
const req = require('express/lib/request.js');
const res = require('express/lib/response.js');
// const Application = require('../models/application_model');
const { default: mongoose } = require('mongoose');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./files")
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now()
    cb(null, uniqueSuffix+file.originalname)
  }
})

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

//extracting text from pdf
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


router.route("/Aadd").post(upload.single("file"), async (req, res) => {
    try {
        const {
            name,
            email,
            portfolio,
            phoneNo,
            introduction,
            jobTitle,
            jobRequirements,
            vacancyId
        } = req.body;

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
            cvScore: null
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
        const extractedText = data.text;

        // Step 4: Prepare OpenAI prompt
        const prompt = `
You are an HR assistant that evaluates candidate CVs based on job descriptions.
Consider the following criteria:
1. **Skills Matching**
2. **Experience Relevance**
3. **Education & Certifications**
4. **Projects & Achievements**
5. **Overall Compatibility Score** – from 0 to 1000

**Job Description:** 
${jobRequirements}

**Candidate's CV:** 
${extractedText}

ONLY return a JSON object:
{
  "score": <numerical_score>
}
        `;

        const response = await axios.post("https://api.openai.com/v1/chat/completions", {
            model: "gpt-4",
            messages: [{ role: "user", content: prompt }]
        }, {
            headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                "Content-Type": "application/json"
            }
        });

        const evaluationResult = JSON.parse(response.data.choices[0].message.content);
        const cvScore = evaluationResult.score;

        await application.findByIdAndUpdate(savedApplication._id, { cvScore });
        console.log("CV evaluated and updated.");
        console.log("CV score is ", cvScore)

        res.json({ evaluation: evaluationResult });

    } catch (err) {
        console.error("Error in /Aadd:", err);
        res.status(500).json({ error: err.message });
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

//view all applications
router.route("/Aview").get((req, res) => {
    application.find().then((applications) => {
        res.json(applications)
    }).catch((err) => {
        console.log(err);
    })
})


//view a specific application
router.route("/Aview/:id").get((req, res) => {
    const id = req.params.id;
    application.findById(id).then((application) => {
        res.json(application)
    }).catch((err) => {
        console.log(err);
    })
})

//application get by vacancy
router.route("/Aview/byVacancy/:vacancyId").get(async (req, res) => {
    try {
        const vacancyId = req.params.vacancyId;
        const applications = await application.find({ vacancyId: vacancyId });

        if (!applications || applications.length === 0) {
            return res.status(404).json({ message: "No applications found for this vacancy ID" });
        }

        res.json(applications);
    } catch (err) {
        console.error("Error fetching applications:", err);
        res.status(500).json({ error: "Internal Server Error" });
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
const express = require('express');
let application = require('../models/application_model');
const router = express.Router();
const app = express();
app.use(express.json());
router.use("/files", express.static("files"));


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
const upload = multer({ storage: storage })


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


//adding a application and extrecting text from pdf
router.route("/Aadd").post(upload.single("file"), async(req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const portfolio = req.body.portfolio;
    const phoneNo = req.body.phoneNo;
    const introduction= req.body.introduction;
    const filename = req.file.filename;
    const jobTitle = req.body.jobTitle;
    const pdfPath = req.file.path;
    const vacancyId = req.body.vacancyId;


    const newApplication = new application({
        name,
        email,
        portfolio,
        phoneNo,
        introduction,
        filename,
        jobTitle,
        vacancyId
    });

    newApplication.save().then(() => {
        // res.json("Application added");
        console.log("Application added");
    }).catch((err) => {
        console.log(err);
    })


// ✅ Correctly define the GET route
    try {
        // const pdfPath = './files/Tiran.pdf'; // Replace with your actual PDF path
        const text = await extractTextFromPDF(pdfPath);

        if (text) {
            // res.json({ extractedText: text });
            console.log({text});
            console.log("Text extracted");

            const { jobRequirements } = req.body;
            //////// Chat GPT integration process //////////
            // Constructing a dynamic prompt based on the job description
                const prompt = `
                    You are an HR assistant that evaluates candidate CVs based on job descriptions.
                    Consider the following criteria:
                    1. **Skills Matching** – Check if the CV mentions required skills.
                    2. **Experience Relevance** – Evaluate if the candidate has relevant work experience.
                    3. **Education & Certifications** – Ensure required qualifications are met.
                    4. **Projects & Achievements** – Look for key projects, awards, or leadership roles.
                    5. **Overall Compatibility Score** – A numerical score between 0 (minimum) and 1000 (maximum).
            
                    **Job Description:** 
                    ${jobRequirements}
            
                    **Candidate's CV:** 
                    ${text}
            
                    **Response Format:**  
                    ONLY return a JSON object as follows:
                    {
                        "score": <numerical_score>
                    }                
                    
                    `;


                try {
                    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
                        model: "gpt-4",
                        messages: [{ role: "user", content: prompt }]
                    }, {
                        headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` }
                    });
            
                    // Extract the response and log the final compatibility score
                    const evaluationResult = response.data.choices[0].message.content;
                    console.log("CV Evaluation Result:", evaluationResult);

                    res.json({ evaluation: evaluationResult });
        } catch (error) {
                    console.error(error);
                    res.status(500).json({ error: "Error processing CV evaluation" });
                }
                
                ///////////// End of Chat GPT integration process ////////////

        } else {
            res.status(500).json({ error: "Failed to extract text." });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }

})

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

module.exports = router;
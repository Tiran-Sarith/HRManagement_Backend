const express = require('express');
const application = require('../models/application_model');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const uploadsDir = path.join(__dirname, '../uploads');

//adding a application
router.route("/Aadd").post((req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const portfolio = req.body.portfolio;
    const phoneNo = req.body.hireType;
    const introduction= req.body.introduction;
    const vacancy = req.body.vacancyId;
    

    const newApplication = new application({
        name,
        email,
        portfolio,
        phoneNo,
        introduction,
        vacancy
    });

    newApplication.save()
        .then(() => {
            res.json("Application added");
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ error: err.message });
        });
})

//view all applications
router.route("/Aview").get((req, res) => {
    application.find()
        .then((applications) => {
            console.log('Sending applications:', applications); // Debug log
            res.json(applications)
        })
        .catch((err) => {
            console.log('Error:', err);
            res.status(500).json({ error: err.message });
        })
});

//view a specific application
router.route("/Aview/:id").get((req, res) => {
    const id = req.params.id;
    application.findById(id).then((application) => {
        res.json(application)
    }).catch((err) => {
        console.log(err);
    })
})

// Get CVs for a specific application
router.route("/cvs/:applicationId").get(async (req, res) => {
    try {
        const applicationId = req.params.applicationId;
        // Assuming you have a CV model/collection
        const cvs = await CV.find({ applicationId: applicationId });
        res.json(cvs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching CVs" });
    }
});

router.route("/download/:filename").get((req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads', filename);
    
    // Check if file exists before attempting download
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found" });
    }
    
    res.download(filePath, filename, (err) => {
        if (err) {
            console.error('Download error:', err);
            return res.status(500).json({
                message: "Could not download the file.",
                error: err.message
            });
        }
    });
});

// Update the route to get CV info
router.route("/cvs/:applicationId").get(async (req, res) => {
    try {
        const applicationId = req.params.applicationId;
        const applicationData = await application.findById(applicationId);
        
        if (!applicationData) {
            return res.status(404).json({ error: "Application not found" });
        }

        // Create CV data from application
        const cvData = {
            id: applicationData._id,
            name: applicationData.name,
            phoneNo: applicationData.phoneNo,
            filename: applicationData.filename,
            // Add any other relevant fields
        };

        res.json([cvData]); // Wrap in array to match expected format
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching CV data" });
    }
});

// Add this new route for getting CV data
router.route("/cvs/:applicationId").get(async (req, res) => {
    try {
        const applicationId = req.params.applicationId;
        const applicationData = await application.findById(applicationId);
        
        if (!applicationData) {
            return res.status(404).json({ error: "Application not found" });
        }

        // Return the application data formatted as CV info
        const cvData = {
            id: applicationData._id,
            name: applicationData.name,
            phoneNo: applicationData.phoneNo,
            email: applicationData.email,
            filename: applicationData.filename,
        };

        res.json([cvData]); // Wrapped in array to match frontend expectations
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching CV data" });
    }
});

// Get specific application
router.route("/Aview/:id").get(async (req, res) => {
    try {
        const applicationData = await application.findById(req.params.id);
        if (!applicationData) {
            return res.status(404).json({ error: "Application not found" });
        }
        res.json(applicationData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching application" });
    }
});

// Download CV file
router.route("/download/:filename").get((req, res) => {
    const filename = req.params.filename;
    // Update this path to match where your files are stored
    const filePath = path.join(__dirname, '../uploads', filename);
    
    if (!fs.existsSync(uploadsDir)){
        fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    res.download(filePath, (err) => {
        if (err) {
            res.status(500).send({
                message: "Could not download the file. " + err,
            });
        }
    });
});

module.exports = router;
const express = require('express');
const application = require('../models/application_model');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const uploadsDir = path.join(__dirname, '../uploads');

//adding an application
router.route("/Aadd").post((req, res) => {
    const { name, email, portfolio, phoneNo, introduction, vacancy, filename } = req.body;

    const newApplication = new application({
        name,
        email,
        portfolio,
        phoneNo,
        introduction,
        vacancy,
        filename
    });

    newApplication.save()
        .then(() => res.json("Application added"))
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: err.message });
        });
});

//view all applications
router.route("/Aview").get((req, res) => {
    application.find()
        .then((applications) => {
            console.log('Sending applications:', applications); // Debug log
            res.json(applications);
        })
        .catch((err) => {
            console.error('Error:', err);
            res.status(500).json({ error: err.message });
        });
});

//view a specific application
router.route("/Aview/:id").get((req, res) => {
    application.findById(req.params.id)
        .then((application) => res.json(application))
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: "Application not found" });
        });
});

//download CV file
router.route("/download/:filename").get((req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads', filename);
    
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found" });
    }
    
    res.download(filePath, filename, (err) => {
        if (err) {
            console.error('Download error:', err);
            res.status(500).json({ message: "Could not download the file.", error: err.message });
        }
    });
});

module.exports = router;

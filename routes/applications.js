const express = require('express');
let application = require('../models/application_model');
const router = express.Router();

//adding a application
router.route("/Aadd").post((req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const portfolio = req.body.portfolio;
    const phoneNo = req.body.hireType;
    const introduction= req.body.introduction;

    const newApplication = new application({
        name,
        email,
        portfolio,
        phoneNo,
        introduction
    });

    newApplication.save().then(() => {
        res.json("Application added");
    }).catch((err) => {
        console.log(err);
    })
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
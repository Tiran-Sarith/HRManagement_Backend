const express = require('express');
let vacancy = require('../models/vaccancy_model');
const router = express.Router();

//adding a job vacancy
router.route("/Vadd").post((req, res) => {
    const { jobTitle, jobCategory, hireType, jobID, deadline, designation, department, postedDate, about, requirements, responsibilities,benefits,whatweoffer } = req.body;

    const newVacancy = new vacancy({
        jobTitle,
        jobCategory,
        hireType,
        jobID,
        deadline,
        designation,
        department,
        postedDate, 
        about, 
        requirements, 
        responsibilities,
        benefits,
        whatweoffer
    });

    newVacancy.save()
        .then(() => res.json("Vacancy added"))
        .catch((err) => console.log(err));
});

//view all job vacancies
router.route("/Vview").get((req, res) => {
    vacancy.find().then((vacancies) => {
        res.json(vacancies)
    }).catch((err) => {
        console.log(err);
    })
})

//view a specific job vacancy
router.route("/Vview/:id").get((req, res) => {
    const id = req.params.id;
    vacancy.findById(id).then((vacancy) => {
        res.json(vacancy)
    }).catch((err) => {
        console.log(err);
    })
})

//update a job vacancy
router.route("/Vupdate/:id").put(async (req, res) => {
    const id = req.params.id;
    const { jobTitle, jobCategory, hireType,requirements, responsibilities,designation,deadline,about,department,,benefits,whatweoffer } = req.body;

    const updateVacancy = {
        jobTitle,
        jobCategory,
        hireType,
        designation,
        deadline,
        requirements, 
        responsibilities,
        about,
        department,
        benefits,
        whatweoffer
    }

    const update = await vacancy.findByIdAndUpdate(id, updateVacancy).then(() => {
        res.status(200).send({ status: "Vacancy updated" })
    }).catch((err) => {
        console.log(err);
        res.status(500).send({ status: "Error with updating data" })
    })
})

//delete a job vacancy
router.route("/Vdelete/:id").delete(async (req, res) => {
    const id = req.params.id;

    await vacancy.findByIdAndDelete(id).then(() => {
        res.status(200).send({ status: "Vacancy deleted" })
    }).catch((err) => {
        console.log(err.message);
        res.status(500).send({ status: "Error with deleting data" })
    })
})


module.exports = router;

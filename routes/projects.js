// routes/projects.js
const express = require('express');
const Project = require('../models/project_model');
const Department = require('../models/department_model');
const router = express.Router();

// Add a project
router.post('/Padd', async (req, res) => {
    const { projectName, departmentID, projectDescription, projectManager, projectStatus, projectDeadline, Number_of_members, projectCategory, projectBudget, projectDuration } = req.body;

    const newProject = new Project({
        projectName,
        departmentID,
        projectDescription,
        projectManager,
        projectStatus,
        projectDeadline,
        Number_of_members,
        projectCategory,
        projectBudget,
        projectDuration
    });

    try {
        await newProject.save();
        res.status(201).send("Project added successfully");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error adding project");
    }
});

// Get all projects
router.get('/Pview', async (req, res) => {
    try {
        const projects = await Project.find().populate('departmentID');
        res.status(200).json(projects);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching projects");
    }
});

// Get a specific project
router.get('/Pview/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const project = await Project.findById(id).populate('departmentID');
        if (!project) return res.status(404).send("Project not found");
        res.status(200).json(project);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching project");
    }
});

// Update a project
router.put('/Pupdate/:id', async (req, res) => {
    const { id } = req.params;
    const { projectName, departmentID, projectDescription, projectManager, projectStatus, projectDeadline, Number_of_members, projectCategory, projectBudget, projectDuration } = req.body;

    try {
        await Project.findByIdAndUpdate(id, {
            projectName,
            departmentID,
            projectDescription,
            projectManager,
            projectStatus,
            projectDeadline,
            Number_of_members,
            projectCategory,
            projectBudget,
            projectDuration
        }, { new: true });
        res.status(200).send("Project updated successfully");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating project");
    }
});

// Delete a project
router.delete('/Pdelete/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await Project.findByIdAndDelete(id);
        res.status(200).send("Project deleted successfully");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error deleting project");
    }
});

module.exports = router;

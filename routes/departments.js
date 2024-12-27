const express = require('express');
const Department = require('../models/department_model');
const router = express.Router();

// Add a department
router.post('/Dadd', async (req, res) => {
    const { departmentID, departmentName, description, Numberofemployees, departmentHead, Numberodprojects, departmentLocation } = req.body;

    const newDepartment = new Department({
        departmentID,
        departmentName,
        description,
        Numberofemployees,
        departmentHead,
        Numberodprojects,
        departmentLocation
    });

    try {
        await newDepartment.save();
        res.status(201).send("Department added successfully");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error adding department");
    }
});

// Get all departments
router.get('/Dview', async (req, res) => {
    try {
        const departments = await Department.find();
        res.status(200).json(departments);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching departments");
    }
});

// Get a specific department
router.get('/Dview/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const department = await Department.findById(id);
        if (!department) return res.status(404).send("Department not found");
        res.status(200).json(department);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching department");
    }
});

// Update a department
router.put('/Dupdate/:id', async (req, res) => {
    const { id } = req.params;
    const { departmentID, departmentName, description, Numberofemployees, departmentHead, Numberodprojects, departmentLocation } = req.body;

    try {
        await Department.findByIdAndUpdate(id, {
            departmentID,
            departmentName,
            description,
            Numberofemployees,
            departmentHead,
            Numberodprojects,
            departmentLocation
        }, { new: true });
        res.status(200).send("Department updated successfully");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating department");
    }
});

// Delete a department
router.delete('/Ddelete/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await Department.findByIdAndDelete(id);
        res.status(200).send("Department deleted successfully");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error deleting department");
    }
});

module.exports = router;

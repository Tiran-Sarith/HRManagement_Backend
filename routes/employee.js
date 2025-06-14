const express = require('express');
let Employee = require('../models/employee_model');
const mongoose = require('mongoose');

const router = express.Router();

//adding a employee
router.route('/Eadd').post((req, res) => {
    const {
        employee_full_name,
        employee_name_with_initials,
        employee_first_name,
        employee_last_name,
        employee_id,
        employee_email,
        employee_nic,
        employee_telephone,
        employee_address,
        employee_designation,
        employee_current_project_id,
        employee_department,
        employee_age,
        employeeepf,
        employee_hireddate,
        employee_company_email
    } = req.body;

    // Create a new Employee instance
    const newEmployee = new Employee({
         employee_full_name,
        employee_name_with_initials,
        employee_first_name,
        employee_last_name,
        employee_id,
        employee_email,
        employee_nic,
        employee_telephone,
        employee_address,
        employee_designation,
        employee_current_project_id,
        employee_department,
        employee_age,
        employeeepf,
        employee_hireddate,
        employee_company_email
    });

    // Save the new employee to the database
    newEmployee
        .save()
        .then(() => res.status(201).json({ message: 'Employee added successfully', employee: newEmployee }))
        .catch((err) => {
            if (err.code === 11000) {
                // Handle duplicate key errors
                if (err.keyValue.employee_id) {
                    return res.status(400).json({ error: 'Duplicate Entry', message: 'Employee ID already exists.' });
                } else if (err.keyValue.employee_nic) {
                    return res.status(400).json({ error: 'Duplicate Entry', message: 'Employee NIC already exists.' });
                }
            }
            // Handle other errors
            res.status(500).json({ error: 'Failed to add employee', details: err.message });
        });
});


//view all employees
router.route("/Eview").get((req, res) => {
    Employee.find().then((employees) => {
        res.json(employees)
    }).catch((err) => {
        console.log(err);
    })
});

//view a specific employee by id
router.get('/Eview/:employee_id', async (req, res) => {
    try {
        const { employee_id } = req.params;

        // Find the employee by employee_id
        const employee = await Employee.findOne({ employee_id });

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.status(200).json(employee);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch employee', details: error.message });
    }
});

// Get employee count by department
router.get('/countByDepartment/:departmentId', async (req, res) => {
    const { departmentId } = req.params;
    console.log(`Counting employees for department: ${departmentId}`); // Add this line to debug

    try {
        const count = await Employee.countDocuments({ employee_department: departmentId });
        console.log(`Employee count for department ${departmentId}: ${count}`); // Add this line to debug
        res.status(200).json({ count });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching employee count");
    }
});


// // get a employee by employee_id
// router.get('/:employee_id', async (req, res) => {
//     try {
//         const { employee_id } = req.params;
//         const employee = await Employee.findOne({ employee_id });

//         if (!employee) {
//             return res.status(404).json({ message: 'Employee not found' });
//         }

//         res.status(200).json(employee);
//     } catch (error) {
//         res.status(500).json({ error: 'Failed to fetch employee', details: error.message });
//     }
// });




//update a employee
router.route("/Eupdate/:id").put(async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            return res.status(400).send({ status: "Error", message: "No ID provided" });
        }

        // Validate if ID is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send({ 
                status: "Error", 
                message: "Invalid ID format" 
            });
        }

        const updateEmployee = {
            employee_full_name: req.body.employee_full_name,
            employee_name_with_initials: req.body.employee_name_with_initials,
            employee_first_name: req.body.employee_first_name,
            employee_last_name: req.body.employee_last_name,
            employee_id: req.body.employee_id,
            employee_email: req.body.employee_email,
            employee_nic: req.body.employee_nic,
            employee_telephone: req.body.employee_telephone,
            employee_address: req.body.employee_address,
            employee_designation: req.body.employee_designation,
            employee_current_project_id: req.body.employee_current_project_id,
            employee_department: req.body.employee_department,
            employee_age: req.body.employee_age,
            employeeepf: req.body.employeeepf,
            employee_hireddate: req.body.employee_hireddate,
            employee_company_email: req.body.employee_company_email
        
        };

        const updatedEmployee = await Employee.findByIdAndUpdate(
            id,
            updateEmployee,
            { new: true, runValidators: true }
        );

        if (!updatedEmployee) {
            return res.status(404).send({ status: "Error", message: "Employee not found" });
        }

        res.status(200).send({ 
            status: "Employee updated", 
            employee: updatedEmployee
        });
    } catch (err) {
        console.error('Update error:', err);
        res.status(500).send({ 
            status: "Error with updating data", 
            error: err.message 
        });
    }
});


//delete a employee
router.route("/Edelete/:id").delete(async (req, res) => {
    const id = req.params.id;

    await Employee.findByIdAndDelete(id).then(() => {
        res.status(200).send({ status: "Employee deleted" })
    }).catch((err) => {
        console.log(err.message);
        res.status(500).send({ status: "Error with deleting data" })
    })
});

// Clear project assignments for all employees assigned to a specific project
router.route("/clearProjectAssignments/:projectId").post(async (req, res) => {
    try {
        const projectId = req.params.projectId;
        
        if (!projectId) {
            return res.status(400).json({ 
                status: "Error", 
                message: "No project ID provided" 
            });
        }

        // Find all employees assigned to this project
        const result = await Employee.updateMany(
            { employee_current_project_id: projectId },
            { $set: { employee_current_project_id: "" } }
        );

        res.status(200).json({ 
            status: "Success", 
            message: "Project assignments cleared",
            modifiedCount: result.modifiedCount
        });
    } catch (err) {
        console.error('Error clearing project assignments:', err);
        res.status(500).json({ 
            status: "Error", 
            message: "Failed to clear project assignments", 
            error: err.message 
        });
    }
});

// Update employee's project ID (new route for just updating project assignment)
router.route("/updateProject/:id").put(async (req, res) => {
    try {
        const id = req.params.id;
        const { employee_current_project_id } = req.body;
        
        if (!id) {
            return res.status(400).send({ status: "Error", message: "No ID provided" });
        }

        // Validate if ID is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send({ 
                status: "Error", 
                message: "Invalid ID format" 
            });
        }

        const updatedEmployee = await Employee.findByIdAndUpdate(
            id,
            { employee_current_project_id },
            { new: true }
        );

        if (!updatedEmployee) {
            return res.status(404).send({ status: "Error", message: "Employee not found" });
        }

        res.status(200).send({ 
            status: "Employee project updated", 
            employee: updatedEmployee
        });
    } catch (err) {
        console.error('Update error:', err);
        res.status(500).send({ 
            status: "Error with updating project assignment", 
            error: err.message 
        });
    }
});

// Update employee with partial data (to handle just specific field updates)
router.route("/EupdatePartial/:id").put(async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            return res.status(400).send({ status: "Error", message: "No ID provided" });
        }

        // Validate if ID is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send({ 
                status: "Error", 
                message: "Invalid ID format" 
            });
        }

        const updatedEmployee = await Employee.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedEmployee) {
            return res.status(404).send({ status: "Error", message: "Employee not found" });
        }

        res.status(200).send({ 
            status: "Employee updated", 
            employee: updatedEmployee
        });
    } catch (err) {
        console.error('Update error:', err);
        res.status(500).send({ 
            status: "Error with updating data", 
            error: err.message 
        });
    }
});

module.exports = router;


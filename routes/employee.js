const express = require('express');
let Employee = require('../models/employee_model');

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
        employee_department
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
        employee_department
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
    const id = req.params.id;

    // Destructuring all attributes from the request body
    const {
        employee_full_name,
        employee_name_with_initials,
        employee_first_name,
        employee_last_name,
        employee_id,                 // Included employee_id
        employee_email,
        employee_nic,
        employee_telephone,
        employee_address,
        employee_designation,
        employee_current_project_id,
        employee_department
    } = req.body;

    // Creating the update object with all attributes
    const updateEmployee = {
        employee_full_name,
        employee_name_with_initials,
        employee_first_name,
        employee_last_name,
        employee_id,                 // Adding employee_id
        employee_email,
        employee_nic,
        employee_telephone,
        employee_address,
        employee_designation,
        employee_current_project_id,
        employee_department
    };

    try {
        // Ensure updated document is returned with { new: true }
        const updatedEmployee = await Employee.findByIdAndUpdate(id, updateEmployee, { new: true });

        if (!updatedEmployee) {
            return res.status(404).send({ status: "Employee not found" });
        }

        res.status(200).send({ 
            status: "Employee updated", 
            employee: updatedEmployee  // Send the updated employee back as confirmation
        });
    } catch (err) {
        console.error(err);
        res.status(500).send({ status: "Error with updating data", error: err.message });
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

module.exports = router;


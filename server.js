const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const app = express();
require('dotenv').config();

const vacancyRouter = require('./routes/vacancies.js');
const applicationRoute = require('./routes/applications.js')
const departmentRoutes = require('./routes/departments');
const projectRoutes = require('./routes/projects');
const employeeRoute = require('./routes/employee.js');

const PORT = process.env.PORT || 8070;

//app middleware
app.use(cors());
app.use(bodyParser.json());

//routes 
app.use('/vacancies', vacancyRouter);
app.use('/departments', departmentRoutes);
app.use('/projects', projectRoutes);
app.use('/applications', applicationRoute);
app.use('/employee', employeeRoute);


const URL = process.env.DB_URL;


mongoose.connect(URL)
.then(() => {
    console.log('Database connected successfully');
})
.catch((err) => console.log("DB connection error",err));




app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

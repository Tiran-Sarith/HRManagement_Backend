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
const fileRoute = require('./routes/pdftext.js');
const PORT = process.env.PORT || 8070;

//app middleware
app.use(cors());
app.use(bodyParser.json());

//routes 
app.use('/api/vacancies', vacancyRouter);
app.use('/api/departments', departmentRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/applications', applicationRoute);
app.use('/api/employee', employeeRoute);
app.use(fileRoute);


const URL = process.env.DB_URL;







mongoose.connect(URL)
.then(() => {
    console.log('Database connected successfully');
})
.catch((err) => console.log("DB connection error",err));

// //multer
// const multer  = require('multer');
// const req = require('express/lib/request.js');
// const res = require('express/lib/response.js');

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "./files")
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now()
//     cb(null, uniqueSuffix+file.originalname)
//   }
// })

// const upload = multer({ storage: storage })


// app.post("/upload-files", upload.single("file"), async(req, res) => {
//   console.log(req.file);
// })

app.get("/", async (req, res)=>{
  res.send("Success!!!!")
})
 
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// module.exports = app;

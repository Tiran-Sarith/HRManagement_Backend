const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const app = express();
require('dotenv').config();

const vacancyRouter = require('./routes/vacancies.js');

const PORT = process.env.PORT || 8070;

//app middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/vacancies', vacancyRouter);

const URL = process.env.DB_URL;







mongoose.connect(URL)
.then(() => {
    console.log('Database connected successfully');
})
.catch((err) => console.log("DB connection error",err));




app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

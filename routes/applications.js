const express = require('express');
let application = require('../models/application_model');
const router = express.Router();
const app = express();
app.use(express.json());
router.use("/files", express.static("files"))



//multer
const multer  = require('multer');
const req = require('express/lib/request.js');
const res = require('express/lib/response.js');
// const Application = require('../models/application_model');
const { default: mongoose } = require('mongoose');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./files")
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now()
    cb(null, uniqueSuffix+file.originalname)
  }
})

require('../models/application_model');
const upload = multer({ storage: storage })


router.post("/upload-files", upload.single("file"), async(req, res) => {
  console.log(req.file);
  const name = req.body.name;
    const email = req.body.email;
    const portfolio = req.body.portfolio;
    const phoneNo = req.body.hireType;
    const introduction= req.body.introduction;
    const filename = req.file.filename;
    const jobTitle = req.file.jobTitle;

    try{
        await Application.create({ name: name, email:email, portfolio: portfolio, phoneNo: phoneNo, introduction:introduction, filename: filename, jobTitle: jobTitle  });
        res.send({status: "ok"});
    }catch(error){
        res.json({status:error})
    }
});




//adding a application
router.route("/Aadd").post(upload.single("file"), async(req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const portfolio = req.body.portfolio;
    const phoneNo = req.body.phoneNo;
    const introduction= req.body.introduction;
    const filename = req.file.filename;
    const jobTitle = req.body.jobTitle;

    const newApplication = new application({
        name,
        email,
        portfolio,
        phoneNo,
        introduction,
        filename,
        jobTitle
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
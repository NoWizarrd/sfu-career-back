import express from 'express'
import mongoose from 'mongoose'
import multer from 'multer'
import cors from 'cors'
import * as dotenv from 'dotenv'

import { 
    loginValidation, 
    practiceCreateValidation, 
    vacancyCreateValidation, 
    studentRegisterValidation, 
    companyRegisterValidation, 
} from './validations.js'; 

import checkAuth from './utils/checkAuth.js';
import * as PracticeController from './controllers/PracticeController.js';
import * as VacancyController from './controllers/VacancyController.js';
import * as StudentController from './controllers/StudentController.js';
import * as CompanyController from './controllers/CompanyController.js';
import * as SkillController from './controllers/SkillController.js';
import * as chatController from './controllers/ChatController.js';
import handleValidationErrors from './utils/handleValidationErrors.js';

dotenv.config()
const dbHost = process.env.DB_HOST;
mongoose.connect(dbHost).then(() => console.log('DB OK'))
    .catch((err) => console.log('DB error', err))

//multer
const storage = multer.diskStorage({
    destination: (_, __, cb) => {
        cb(null, 'uploads')
    },
    filename: (_, file, cb) => {
        cb(null, file.originalname)
    },
})
const upload = multer({ storage })


const app = express()
app.use(express.json())
app.use('/uploads', express.static('uploads'))
app.use(cors())
//app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
    res.json({
        url: `/uploads/${req.file.originalname}`
    })
})


// Practice routes (fix security to post on front)
app.post('/practices', checkAuth, PracticeController.createPractice);
app.get('/practices/:id', checkAuth, PracticeController.getPracticeById);
app.patch('/practices/:id', checkAuth, practiceCreateValidation, handleValidationErrors, PracticeController.updatePractice);
app.delete('/practices/:id', checkAuth, PracticeController.removePractice);
app.post('/practices/multiple', checkAuth, PracticeController.createMultiplePractices);
app.get('/students/:studentId/practices', checkAuth, PracticeController.getPracticesByStudentId);

// Vacancy routes (fix security to post on front)
app.post('/vacancies', checkAuth, vacancyCreateValidation, handleValidationErrors, VacancyController.createVacancy);
app.get('/vacancies', VacancyController.getVacancies);
app.get('/vacancies/:id', VacancyController.getOneVacancy);
app.patch('/vacancies/:id', checkAuth, VacancyController.updateVacancy);
app.delete('/vacancies/:id', checkAuth, VacancyController.deleteVacancy);
app.get('/companies/:companyId/vacancies', VacancyController.getVacanciesByCompanyId);

// Student routes
app.post('/students/register', studentRegisterValidation, handleValidationErrors, StudentController.registerStudent);
app.post('/students/login', loginValidation, handleValidationErrors, StudentController.loginStudent);
app.get('/students', StudentController.getStudents);
app.get('/students/:id', StudentController.getStudentProfile);
app.patch('/students/:id', checkAuth, StudentController.updateStudentProfile);

// Company routes
app.post('/companies/register', companyRegisterValidation, handleValidationErrors, CompanyController.registerCompany);
app.post('/companies/login', loginValidation, handleValidationErrors, CompanyController.loginCompany);
app.get('/companies/:id', CompanyController.getCompanyProfile);
app.patch('/companies/:id', checkAuth, CompanyController.updateCompanyProfile);

// Skill routes
app.get('/skills', SkillController.getAllSkills)
app.delete('/skills', checkAuth, SkillController.deleteSkill)
app.post('/skills/many', checkAuth, SkillController.createSkills)
app.post('/skills', checkAuth, SkillController.createSkill)

// Chat routes
app.post('/chats/message', checkAuth, chatController.sendMessage);
app.get('/chats/:chatId/messages', checkAuth, chatController.getMessages);
app.get('/chats', checkAuth, chatController.getUserChats);

app.listen(4444, (err) => {
    if (err) {
        return console.log(err)
    } 

    console.log('Server OK')
})
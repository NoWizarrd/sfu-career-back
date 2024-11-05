import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import Student from '../models/Student.js';

export const registerStudent = async (req, res) => {
    try {
        const password = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        const student = new Student({
            surname: req.body.surname,
            name: req.body.name,
            patronymic: req.body.patronymic,
            email: req.body.email,
            avatarUrl: req.body.avatarUrl,
            passwordHash: hash,
            institute: req.body.institute,
            specialty: req.body.specialty,
            course: req.body.course,
            about: req.body.about
        });

        const savedStudent = await student.save();

        const token = jwt.sign(
            {   
                _id: student._id,
                user: 'student'  
            },
            "secretKey",
            { expiresIn: '3d' }
        );

        const { passwordHash, email, ...studentData } = savedStudent._doc;
        
        res.json({
            ...studentData,
            token
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Не удалось зарегистрировать студента"
        });
    }
};

export const loginStudent = async (req, res) => {
    try {
        const student = await Student.findOne({ email: req.body.email }).populate('personalSkills');

        if (!student) {
            return res.status(404).json({
                message: 'Студент не найден'
            });
        }

        const isValidPassword = await bcrypt.compare(req.body.password, student.passwordHash);

        if (!isValidPassword) {
            return res.status(400).json({
                message: 'Неверный логин или пароль'
            });
        }

        const token = jwt.sign(
            { _id: student._id,
              user: 'student'  
            },
            "secretKey",
            { expiresIn: '3d' }
        );

        const { passwordHash, personalSkills, email, ...studentData } = student._doc;
        studentData.personalSkills = personalSkills.map(skill => skill.skill);
        res.json({
            ...studentData,
            token
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Не удалось авторизоваться"
        });
    }
};

export const getStudentProfile = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id).populate('personalSkills')
        if (!student) {
            return res.status(404).json({
                message: 'Студент не найден',
            });
        }
        const { passwordHash, personalSkills, email, practices, ...studentData } = student._doc;
        studentData.personalSkills = personalSkills.map(skill => skill.skill);
        res.json(studentData);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Нет доступа"
        });
    }
};

export const getStudents = async (req, res) => {
    try {
        const students = await Student.find().populate('personalSkills')

        if (!students) {
            return res.status(404).json({
                message: 'Студентов нет'
            });
        }
        
        const studentsData = students.map(student => {
            const { passwordHash, personalSkills, email, ...studentInfo } = student._doc;
            studentInfo.personalSkills = personalSkills.map(skill => skill.skill);
            return studentInfo;
        });

        res.json(studentsData);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Нет доступа"
        });
    }
};

// fix update (personalSkills)?
export const updateStudentProfile = async (req, res) => {
    try {
        const { password, personalSkills, about, avatarUrl } = req.body;

        const student = await Student.findById(req.params.id).populate('personalSkills');

        if (!student) {
            return res.status(404).json({
                message: 'Студент не найден'
            });
        }

        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);
            student.passwordHash = hash;
        }

        if (personalSkills) student.personalSkills = personalSkills;
        if (about) student.about = about;
        if (avatarUrl) student.avatarUrl = avatarUrl;

        const updatedStudent = await student.save();

        const { passwordHash, email, ...studentData } = updatedStudent._doc;

        res.json(studentData);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Не удалось обновить профиль студента"
        });
    }
};

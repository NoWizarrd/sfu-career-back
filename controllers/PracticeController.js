import Practice from '../models/Practice.js';
import Student from '../models/Student.js';
import mongoose from "mongoose";

// Метод создания одной практики
export const createPractice = async (req, res) => {
    try {
        const { rating, company, practiceName, course, companyReview, student } = req.body;

        // Проверка, существует ли уже практика за данный курс у студента
        const existingPractice = await Practice.findOne({ student: student, course });
        if (existingPractice) {
            return res.status(400).json({
                message: `Практика за курс ${course} уже существует для данного студента`
            });
        }

        const practice = new Practice({
            rating,
            company: company ? company : null,
            companyName: company ? undefined : company,
            student,
            practiceName,
            course,
            companyReview
        });

        const savedPractice = await practice.save();

        // Обновление студента с добавлением новой практики
        await Student.findByIdAndUpdate(
            student,
            { $push: { practices: savedPractice._id } },
            { new: true }
        );

        res.json(savedPractice);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Не удалось создать практику"
        });
    }
};

// Метод создания нескольких практик
export const createMultiplePractices = async (req, res) => {
    try {
        const practicesData = req.body;

        const savedPractices = await Promise.all(practicesData.map(async (practiceData) => {
            if (!practiceData.student) {
                throw new Error('Укажите ID студента');
            }

            // Проверка, существует ли уже практика за данный курс у студента
            const existingPractice = await Practice.findOne({ student: practiceData.student, course: practiceData.course });
            if (existingPractice) {
                throw new Error(`Практика за курс ${practiceData.course} уже существует для студента ${practiceData.student}`);
            }

            let company = null;
            if (mongoose.Types.ObjectId.isValid(practiceData.company)) {
                company = practiceData.company;
            }

            const practice = new Practice({
                rating: practiceData.rating,
                company: company ? company : null,
                companyName: company ? undefined : practiceData.company,
                student: practiceData.student,
                practiceName: practiceData.practiceName,
                course: practiceData.course,
                companyReview: practiceData.companyReview,
            });

            const savedPractice = await practice.save();

            // Обновление студента с добавлением новой практики
            await Student.findByIdAndUpdate(
                practiceData.student,
                { $push: { practices: savedPractice._id } },
                { new: true }
            );

            return savedPractice;
        }));

        res.json(savedPractices);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Не удалось создать практики"
        });
    }
};

// Метод получения практики по ID
export const getPracticeById = async (req, res) => {
    try {
        const practice = await Practice.findById(req.params.id).populate('student', 'surname name patronymic');

        if (!practice) {
            return res.status(404).json({ message: 'Практика не найдена' });
        }

        res.json(practice);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Не удалось получить практику"
        });
    }
};

// Метод обновления практики
export const updatePractice = async (req, res) => {
    try {
        const practiceId = req.params.id;
        const { studentId, course } = req.body;

        // Проверка на существование практики
        const existingPractice = await Practice.findOne({ _id: practiceId, student: studentId });
        if (!existingPractice) {
            return res.status(404).json({
                message: "Практика не найдена или не принадлежит данному студенту"
            });
        }

        // Проверка на уникальность курса
        const duplicatePractice = await Practice.findOne({ student: studentId, course, _id: { $ne: practiceId } });
        if (duplicatePractice) {
            return res.status(400).json({
                message: `Практика за курс ${course} уже существует для данного студента`
            });
        }

        const updatedPractice = await Practice.findOneAndUpdate(
            { _id: practiceId, student: studentId },
            { $set: req.body },
            { new: true }
        );

        res.json(updatedPractice);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Не удалось обновить практику"
        });
    }
};

// Метод удаления практики
export const removePractice = async (req, res) => {
    try {
        const practiceId = req.params.id;

        const practice = await Practice.findById(practiceId);

        if (!practice) {
            return res.status(404).json({
                message: "Практика не найдена"
            });
        }

        await Practice.findByIdAndDelete(practiceId);

        await Student.findByIdAndUpdate(
            practice.student,
            { $pull: { practices: practiceId } },
            { new: true }
        );

        res.json({
            success: true
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Не удалось удалить практику"
        });
    }
};

// Метод получения практик студента по его ID
export const getPracticesByStudentId = async (req, res) => {
    try {
        const practices = await Practice.find({ student: req.params.studentId }).populate('company', 'name');

        // if (!practices) {
        //     return res.status(404).json({ message: 'Практики не найдены' });
        // }
        if (!practices || practices.length === 0) {
            return res.json([]);
        }
        res.json(practices);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Не удалось получить практики"
        });
    }
};

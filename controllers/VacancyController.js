import Vacancy from "../models/Vacancy.js";
import mongoose from "mongoose";

export const createVacancy = async (req, res) => {
    try {
        const {
            title,
            company,
            description,
            requiredSkills,
            salary,
            benefits,
            isOpen,
        } = req.body;

        const vacancy = new Vacancy({
            title,
            description,
            company,
            requiredSkills,
            salary,
            benefits,
            isOpen,
        });

        const savedVacancy = await vacancy.save();

        res.json(savedVacancy);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Не удалось создать вакансию",
        });
    }
};

export const getOneVacancy = async (req, res) => {
    try {
        const vacancyId = req.params.id;

        const vacancy = await Vacancy.findById(vacancyId).populate('company requiredSkills');

        if (!vacancy) {
            return res.status(404).json({
                message: "Не удалось найти вакансию",
            });
        }

        const { requiredSkills, company, ...vacancyInfo } = vacancy._doc;
        vacancyInfo.company = {};

        for (let key in company) {
            if (key === "_id" || key === "name" || key === "industry" || key === "location" || key === "avatarUrl") {
                vacancyInfo.company[key] = company[key];
            }
        }
        vacancyInfo.requiredSkills = requiredSkills.map(skill => skill.skill);
        res.json(vacancyInfo);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Не удалось получить вакансию",
        });
    }
};


export const getVacancies = async (req, res) => {
    try {
        const vacancies = await Vacancy.find().populate('company requiredSkills');

        if (!vacancies) {
            return res.status(404).json({
                message: 'Вакансий нет'
            });
        }
        const vacancyData = vacancies.map(vacancy => {
            const { requiredSkills, company, ...vacancyInfo } = vacancy._doc;
            vacancyInfo.company = {}
            for (let key in company){
                
                if(key == "_id" || key == "name" || key == "industry" || key == "location" || key == "avatarUrl" ){
                    vacancyInfo.company[key] = company[key]
                }
            }
            vacancyInfo.requiredSkills = requiredSkills.map(skill => skill.skill);
            return vacancyInfo;
        });
        res.json(vacancyData);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Не удалось получить вакансии",
        });
    }
};

// Метод обновления вакансии
export const updateVacancy = async (req, res) => {
    try {
        const { title, description, requiredSkills, salary, benefits, isOpen } = req.body;
        const vacancyId = req.params.id;

        const vacancy = await Vacancy.findById(vacancyId);

        if (!vacancy) {
            return res.status(404).json({
                message: 'Вакансия не найдена'
            });
        }

        // Проверка на принадлежность вакансии к компании
        if (vacancy.company.toString() !== req.userId) {
            return res.status(403).json({
                message: 'Вы не имеете права обновлять эту вакансию'
            });
        }

        if (title) vacancy.title = title;
        if (description) vacancy.description = description;
        if (requiredSkills) vacancy.requiredSkills = requiredSkills;
        if (salary !== undefined) vacancy.salary = salary;
        if (benefits) vacancy.benefits = benefits;
        if (isOpen !== undefined) vacancy.isOpen = isOpen;

        const updatedVacancy = await vacancy.save();

        res.json(updatedVacancy);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Не удалось обновить вакансию",
        });
    }
};


export const deleteVacancy = async (req, res) => {
    try {
        const vacancyId = req.params.id;

        const vacancy = await Vacancy.findById(vacancyId);

        if (!vacancy) {
            return res.status(404).json({
                message: "Вакансия не найдена",
            });
        }

        if (vacancy.company.toString() !== req.userId) {
            return res.status(403).json({
                message: 'Вы не имеете права удалять эту вакансию'
            });
        }

        await Vacancy.findByIdAndDelete(vacancyId);

        res.json({
            success: true,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Не удалось удалить вакансию",
        });
    }
};


// Метод получения вакансий компании по её ID
export const getVacanciesByCompanyId = async (req, res) => {
    try {
        const companyId = req.params.companyId;

        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            return res.status(400).json({ message: "Некорректный ID компании" });
        }

        const vacancies = await Vacancy.find().populate('company requiredSkills');

        const companyVacancies = vacancies.filter(vacancy => vacancy.company._id.toString() === companyId);

        if (!companyVacancies || companyVacancies.length === 0) {
            return res.status(404).json({ message: 'Вакансий нет' });
        }

        const vacancyData = companyVacancies.map(vacancy => ({
            _id: vacancy._id,
            title: vacancy.title
        }));

        res.json(vacancyData);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Не удалось получить вакансии"
        });
    }
};
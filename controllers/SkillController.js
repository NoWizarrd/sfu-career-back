import Skill from '../models/Skill.js';

export const getAllSkills = async (req, res) => {
    try {
        const skills = await Skill.find();
        res.json(skills);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Не удалось получить список навыков" });
    }
};

export const createSkill = async (req, res) => {
    try {
        const { skill } = req.body;
        const existingSkill = await Skill.findOne({ skill });

        if (existingSkill) {
            return res.status(400).json({ message: "Навык уже существует" });
        }

        const newSkill = new Skill({ skill });
        await newSkill.save();
        res.status(201).json(newSkill);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Не удалось создать новый навык" });
    }
};

export const deleteSkill = async (req, res) => {
    try {
        const { id } = req.params;
        const skill = await Skill.findById(id);

        if (!skill) {
            return res.status(404).json({ message: "Навык не найден" });
        }

        await skill.remove();
        res.json({ message: "Навык успешно удален" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Не удалось удалить навык" });
    }
};

export const createSkills = async (req, res) => {
    try {
        const { skills } = req.body;

        if (!skills || !Array.isArray(skills)) {
            return res.status(400).json({ message: "Навыки не найдены в теле запроса" });
        }

        const newSkills = await Skill.insertMany(skills);

        res.status(201).json(newSkills);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Не удалось создать новые навыки" });
    }
};

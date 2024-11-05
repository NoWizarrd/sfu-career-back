import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import Company from '../models/Company.js';

export const registerCompany = async (req, res) => {
    try {
        const password = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const company = new Company({
            name: req.body.name,
            email: req.body.email,
            avatarUrl: req.body.avatarUrl,
            passwordHash: hash,
            industry: req.body.industry,
            location: req.body.location,
            description: req.body.description,
            website: req.body.website
        });

        const savedCompany = await company.save();

        const token = jwt.sign(
            { _id: savedCompany._id,
              user: 'company',
            },
            "secretKey",
            { expiresIn: '3d' }
        );

        const { passwordHash, email, ...companyData } = savedCompany._doc;

        res.json({
            ...companyData,
            token
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Не удалось зарегистрировать компанию"
        });
    }
};

export const loginCompany = async (req, res) => {
    try {
        const company = await Company.findOne({ email: req.body.email });

        if (!company) {
            return res.status(404).json({
                message: 'Компания не найдена'
            });
        }

        const isValidPassword = await bcrypt.compare(req.body.password, company.passwordHash);

        if (!isValidPassword) {
            return res.status(400).json({
                message: 'Неверный логин или пароль'
            });
        }

        const token = jwt.sign(
            { _id: company._id,
              user: 'company',
            },
            "secretKey",
            { expiresIn: '3d' }
        );

        const { passwordHash, email, ...companyData } = company._doc;

        res.json({
            ...companyData,
            token
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Не удалось авторизоваться"
        });
    }
};

export const getCompanyProfile = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);

        if (!company) {
            return res.status(404).json({
                message: 'Компания не найдена'
            });
        }

        const { passwordHash, email, ...companyData } = company._doc;

        res.json(companyData);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Нет доступа"
        });
    }
};

export const updateCompanyProfile = async (req, res) => {
    try {
        const { password, location, description, avatarUrl, website } = req.body;

        const company = await Company.findById(req.params.id);

        if (!company) {
            return res.status(404).json({
                message: 'Компания не найдена'
            });
        }

        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);
            company.passwordHash = hash;
        }

        if (description) company.description = description;
        if (location) company.location = location;
        if (website) company.website = website;
        if (avatarUrl) company.avatarUrl = avatarUrl;

        const updatedCompany = await company.save();

        const { passwordHash, email, ...companyData } = updatedCompany._doc;

        res.json(companyData);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Не удалось обновить профиль компании"
        });
    }
};

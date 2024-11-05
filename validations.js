import {body} from 'express-validator'
import mongoose from "mongoose";

export const loginValidation = [
    body('email', 'Неверный формат почты').isEmail(),
    body('password', 'Пароль меньше 5 символов').isLength({min: 5}),
]

export const companyRegisterValidation = [
    body('email', 'Неверный формат почты').isEmail(),
    body('password', 'Пароль должен содержать не менее 5 символов').isLength({ min: 5 }),
    body('name', 'Укажите название компании').isLength({ min: 2 }),
    body('location', 'Укажите адрес').isString(),
    body('avatarUrl', 'Неверная ссылка на аватарку').optional().isURL(),
];

export const studentRegisterValidation = [
    body('email', 'Неверный формат почты').isEmail(),
    body('password', 'Пароль должен содержать не менее 5 символов').isLength({ min: 5 }),
    body('surname', 'Укажите фамилию').isLength({ min: 2 }),
    body('name', 'Укажите имя').isLength({ min: 2 }),
    body('patronymic', 'Укажите отчество').isLength({ min: 2 }),
    body('institute', 'Укажите учебное заведение').isLength({ min: 2 }),
    body('specialty', 'Укажите специальность').isLength({ min: 3 }),
    body('course', 'Укажите курс обучения').isInt({ min: 1, max:5 }),
    body('about', 'Напишите что-то о себе').optional().isString(),
    body('avatarUrl', 'Неверная ссылка на аватарку').optional().isURL(),
];


export const practiceCreateValidation = [
    body('rating', 'Рейтинг должен быть числом').isNumeric(),
    body('company')
        .optional({ nullable: true, checkFalsy: true }) // позволяет company быть null или undefined
        .custom((value, { req }) => {
            if (value && !mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('Укажите действительный ID компании.');
            }
            return true;
        }),
    body('companyName')
        .if(body('company').isEmpty()) // companyName обязательно, если company пустое
        .notEmpty().withMessage('Укажите название компании')
        .isLength({ min: 3 }).withMessage('Название компании должно содержать минимум 3 символа'),
    body('practiceName', 'Укажите название практики').isLength({ min: 3 }),
    body('course', 'Укажите курс').isInt({ min: 1 }),
    body('companyReview', 'Укажите отзыв компании').optional().isLength({ min: 3 }),
];



export const vacancyCreateValidation = [
    body('title', 'Укажите название вакансии').isLength({ min: 3 }),
    body('description', 'Укажите описание вакансии').isLength({ min: 10 }),
    body('requiredSkills', 'Укажите требования').isArray(),
    body('salary', 'Зарплата должна быть числом').optional().isNumeric(),
    body('benefits', 'Укажите выгоды').optional().isArray(),
    body('isOpen', 'Статус должен быть булевым значением').optional().isBoolean(),
];

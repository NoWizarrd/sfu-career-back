import Chat from '../models/Chat.js';
import mongoose from 'mongoose';

// Создание переписки (если она не существует) и отправка сообщения
export const sendMessage = async (req, res) => {
    try {
        const { sender, senderModel, recipient, recipientModel, text, isResponseToVacancy, vacancyId } = req.body;

        // Преобразование моделей к заглавному регистру
        const senderModelCapitalized = senderModel.charAt(0).toUpperCase() + senderModel.slice(1);
        const recipientModelCapitalized = recipientModel.charAt(0).toUpperCase() + recipientModel.slice(1);

        // Проверка существующего чата между участниками
        let chat = await Chat.findOne({
            participants: { $all: [sender, recipient], $size: 2 },
            participantsModel: { $all: [senderModelCapitalized, recipientModelCapitalized], $size: 2 }
        });

        // Если чата нет, создаем новый
        if (!chat) {
            chat = new Chat({
                participants: [sender, recipient],
                participantsModel: [senderModelCapitalized, recipientModelCapitalized],
                messages: []
            });
        }

        const message = {
            sender,
            senderModel: senderModelCapitalized,
            text,
            isResponseToVacancy,
            vacancyId,
        };

        chat.messages.push(message);
        await chat.save();

        res.json(chat);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Не удалось отправить сообщение",
        });
    }
};

// Получение сообщений
export const getMessages = async (req, res) => {
    try {
        const { chatId } = req.params;
        const chat = await Chat.findById(chatId).select('messages');

        if (!chat) {
            return res.status(404).json({
                message: "Чат не найден",
            });
        }

        res.json(chat.messages);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Не удалось получить сообщения",
        });
    }
};

// Получение всех чатов пользователя
export const getUserChats = async (req, res) => {
    try {
        const userId = req.userId;  // ID текущего пользователя

        // Ищем чаты, где userId присутствует среди участников
        const chats = await Chat.find({
            participants: userId,
        }).select('-messages');

        if (!chats){
            chats = null
        }

        res.json(chats);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Не удалось получить чаты",
        });
    }
};
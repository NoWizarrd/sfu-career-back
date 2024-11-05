import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'senderModel',
        required: true,
    },
    senderModel: {
        type: String,
        required: true,
        enum: ['Student', 'Company']
    },
    text: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    isResponseToVacancy: {
        type: Boolean,
        default: false,
    },
    vacancyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vacancy',
        required: false,
    },
});

const ChatSchema = new mongoose.Schema({
    participants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'participantsModel',
        },
    ],
    participantsModel: [
        {
            type: String,
            enum: ['Student', 'Company']
        }
    ],
    messages: [MessageSchema],
}, {
    timestamps: true,
});

export default mongoose.model('Chat', ChatSchema);

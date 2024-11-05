import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema({
    surname: {type: String, required: true},
    name: {type: String, required: true},
    patronymic: {type: String, required: true},
    email: {
        type: String,
        required: true,
        unique: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    institute: {
        type: String,
        required: true,
    },
    specialty: {type: String, required: true},
    course: {type: Number, required: true},
    personalSkills: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill',
    }],
    practices: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Practice',
    }],
    about: String,
    avatarUrl: String,
},
{
    timestamps: true,
});

export default mongoose.model('Student', StudentSchema);
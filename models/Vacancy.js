import mongoose from "mongoose";

const VacancySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    requiredSkills: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill'
    }],
    salary: Number,
    benefits: [String],
    isOpen: {
        type: Boolean,
        default: true,
    },
},
{
    timestamps: true,
});

export default mongoose.model('Vacancy', VacancySchema);

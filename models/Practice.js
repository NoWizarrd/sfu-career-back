import mongoose from "mongoose";

const PracticeSchema = new mongoose.Schema({
    rating: {
        type: Number,
        required: true,
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
    },
    companyName: {
        type: String,
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
    },
    practiceName: {
        type: String,
        required: true,
    },
    course: {
        type: Number,
        required: true,
    },
    companyReview: String,
},
{
    timestamps: true,
});

export default mongoose.model('Practice', PracticeSchema);
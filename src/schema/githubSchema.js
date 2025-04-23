import mongoose from 'mongoose';

const ContributionSchema = new mongoose.Schema({
    username: String,
    date: String,           // e.g., "2024-04-22"
    count: Number,          // number of commits that day
}, { timestamps: true });

export default mongoose.model('Contribution', ContributionSchema);

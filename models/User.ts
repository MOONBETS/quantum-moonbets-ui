// User.ts 
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    walletAddress: { type: String, unique: true },
    referrerAddress: { type: String, default: null },
    referredUsers: [{ type: String }],
    volume: { type: Number, default: 0 },
    disqualified: { type: Boolean, default: false },
    joinedAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model('User', userSchema);

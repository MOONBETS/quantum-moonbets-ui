// AdminConfig.ts
import mongoose from 'mongoose';

const adminConfigSchema = new mongoose.Schema({
    platformAccount: String,
    platformStatsAccount: String,
    totalVolume: { type: Number, default: 0 },
});

export default mongoose.models.AdminConfig || mongoose.model('AdminConfig', adminConfigSchema);

// api/admin/stats/route.ts
import { connectToDB } from '@/lib/mongodb';
import User from '@/models/User';
import AdminConfig from '@/models/AdminConfig';
import { NextResponse } from 'next/server';

export async function GET() {
    await connectToDB();

    const totalUsers = await User.countDocuments();
    const disqualified = await User.countDocuments({ disqualified: true });
    const config = await AdminConfig.findOne();

    return NextResponse.json({
        totalUsers,
        disqualified,
        totalVolume: config?.totalVolume || 0,
    });
}

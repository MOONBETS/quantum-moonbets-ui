// app/api/referral/increment-volume/route.ts
import { connectToDB } from '@/lib/mongodb';
import User from '@/models/User';
import AdminConfig from '@/models/AdminConfig';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const { walletAddress, amount } = await req.json();
    await connectToDB();

    const user = await User.findOne({ walletAddress });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    user.volume += amount;
    await user.save();

    let config = await AdminConfig.findOne();
    if (!config) config = new AdminConfig();
    config.totalVolume += amount;
    await config.save();

    return NextResponse.json({ success: true });
}

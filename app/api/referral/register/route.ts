// api/referral/register / route.ts
import { connectToDB } from '@/lib/mongodb';
import User from '@/models/User';
import AdminConfig from '@/models/AdminConfig';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const { walletAddress, referrerAddress } = await req.json();
    await connectToDB();

    if (!walletAddress) return NextResponse.json({ error: 'Missing wallet' }, { status: 400 });

    let user = await User.findOne({ walletAddress });
    if (user) return NextResponse.json({ error: 'User exists' }, { status: 409 });

    let referrer = null;
    if (referrerAddress) {
        referrer = await User.findOne({ walletAddress: referrerAddress });
        if (!referrer) return NextResponse.json({ error: 'Invalid referrer' }, { status: 400 });
    }

    user = await User.create({ walletAddress, referrerAddress });
    if (referrer) {
        referrer.referredUsers.push(walletAddress);
        await referrer.save();
    }

    return NextResponse.json({ success: true, user });
}

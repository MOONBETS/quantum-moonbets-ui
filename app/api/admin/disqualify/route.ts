// disqualify/route.ts
import { connectToDB } from '@/lib/mongodb';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const { walletAddress } = await req.json();
    await connectToDB();

    const user = await User.findOne({ walletAddress });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    user.disqualified = true;
    await user.save();

    return NextResponse.json({ success: true });
}

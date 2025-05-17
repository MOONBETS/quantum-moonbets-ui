// app/api/admin/set-platform/route.ts
import { connectToDB } from '@/lib/mongodb';
import AdminConfig from '@/models/AdminConfig';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const { platformAccount, platformStatsAccount } = await req.json();
    await connectToDB();

    let config = await AdminConfig.findOne();
    if (!config) config = new AdminConfig();
    config.platformAccount = platformAccount;
    config.platformStatsAccount = platformStatsAccount;
    await config.save();

    return NextResponse.json({ success: true });
}

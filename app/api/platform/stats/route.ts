// app/api/platform/stats/route.ts

import { NextResponse } from "next/server";
import { getProgram, platformStats, platformVault } from "@/lib/solana/program";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export async function GET() {
    try {
        const program = getProgram();
        if (!program) {
            return NextResponse.json({ error: "Program not initialized" }, { status: 400 });
        }
        
        const platform = await program.account.platformStats.fetch(platformStats);

        // Extract all platform stats fields
        const isInitialized = platform.isInitialized;
        const lastReset = platform.lastReset.toNumber();
        const withdrawnToday = platform.withdrawnToday.toNumber() / LAMPORTS_PER_SOL; // Convert to SOL
        const primaryAdmin = platform.primaryAdmin.toString();
        const adminCount = platform.adminCount;
        const totalBets = platform.totalBets.toNumber();
        const totalVolume = platform.totalVolume.toNumber() / LAMPORTS_PER_SOL; // Convert to SOL
        const totalUsers = platform.totalUsers.toNumber();
        const dailyWithdrawal = platform.dailyWithdrawal; // Extract further if needed
        const totalProfit = platform.totalProfit.toNumber() / LAMPORTS_PER_SOL;
        const totalOwed = platform.totalOwed.toNumber() / LAMPORTS_PER_SOL;
        const currentActiveUsers = platform.currentActiveUsers.toNumber();
        const maxBetLamports = platform.maxBetLamports.toNumber() / LAMPORTS_PER_SOL; // Convert to SOL
        const dailyWithdrawLimit = platform.dailyWithdrawLimit.toNumber() / LAMPORTS_PER_SOL; // Convert to SOL

        console.log("=== Full Platform Stats ===");
        
        const platformData = {
            isInitialized,
            lastReset,
            withdrawnToday,
            primaryAdmin,
            adminCount,
            totalBets,
            totalVolume,
            totalUsers,
            dailyWithdrawal,
            totalProfit: totalProfit,
            totalOwed: totalOwed,
            currentActiveUsers,
            maxBetLamports,
            dailyWithdrawLimit,
        };
        console.log("Platform Stats:", platformData);
        return NextResponse.json(platformData, { status: 200 });
    } catch (err) {
        console.error("Failed to load platform stats", err);
        return NextResponse.json({ error: "Failed to load platform stats" }, { status: 500 });
    }
}

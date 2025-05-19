// app/api/platform/stats/route.ts

import { NextResponse } from "next/server";
import { getProgram } from "@/lib/solana/program";

export async function GET() {
    try {
        const program = getProgram();
        if (!program) {
            return NextResponse.json({ error: "Program not initialized" }, { status: 400 });
        }
        const accounts = await program.account.platformStats.all();
        const stats = accounts.map((a) => a.account);
        return NextResponse.json(stats);
    } catch (err) {
        console.error("Failed to load platform stats", err);
        return NextResponse.json({ error: "Failed to load platform stats" }, { status: 500 });
    }
}

// app/api/admin/[wallet]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import { getProgram } from "@/lib/solana/program";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const wallet = searchParams.get("wallet");

        if (!wallet) {
            return NextResponse.json({ error: "Missing wallet parameter" }, { status: 400 });
        }

        const adminPubkey = new PublicKey(wallet);
        const program = getProgram();

        const [adminPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("admin"), adminPubkey.toBuffer()],
            program.programId
        );

        const account = await program.account.admin.fetch(adminPda);

        return NextResponse.json({
            pubkey: account.pubkey.toBase58(),
            isActive: account.isActive,
            pda: adminPda.toBase58(),
        });
    } catch (e: any) {
        console.error("Failed to fetch admin account:", e);
        return NextResponse.json({ error: "Failed to fetch admin account", details: e.message }, { status: 500 });
    }
}

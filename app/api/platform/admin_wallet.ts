// app/api/admin/[wallet]/route.ts
import { NextResponse } from "next/server";
import { getProgram } from "@/lib/solana/program";
import { PublicKey } from "@solana/web3.js";

interface Params {
    params: { wallet: string };
}

export async function GET(
    _request: Request,
    { params }: Params
) {
    try {
        const program = getProgram();
        if (!program) {
            return NextResponse.json({ error: "Program not initialized" }, { status: 400 });
        }
        const adminPubkey = new PublicKey(params.wallet);
        const [adminPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("admin"), adminPubkey.toBuffer()],
            program.programId
        );
        const account = await program.account.admin.fetch(adminPda);
        return NextResponse.json(account);
    } catch (err) {
        console.error("Failed to fetch admin account", err);
        return NextResponse.json({ error: "Failed to fetch admin account" }, { status: 500 });
    }
}

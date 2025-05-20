import { NextRequest, NextResponse } from "next/server";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { getProgram, platformStats, platformVault } from "@/lib/solana/program";
import { BN } from "@coral-xyz/anchor";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { admin, amount } = body;

        if (!admin || !amount) {
            return NextResponse.json({ error: "Missing admin or amount" }, { status: 400 });
        }

        const adminPubkey = new PublicKey(admin);
        const amountBN = new BN(amount);

        const program = getProgram();

        const [adminPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("admin"), adminPubkey.toBuffer()],
            program.programId
        );

        const ix = await program.methods
            .adminWithdraw(amountBN)
            .accountsStrict({
                admin: adminPubkey,
                platformVault: platformVault,
                platformStats: platformStats,
                adminAccount: adminPda,
                systemProgram: SystemProgram.programId,
            })
            .instruction();

        const { blockhash } = await program.provider.connection.getLatestBlockhash();
        const tx = new Transaction().add(ix);
        tx.feePayer = adminPubkey;
        tx.recentBlockhash = blockhash;

        const serialized = tx.serialize({ requireAllSignatures: false });

        return NextResponse.json({
            transaction: Buffer.from(serialized).toString("base64")
        });
    } catch (e: any) {
        console.error("Admin withdraw error:", e);
        return NextResponse.json({
            error: "Internal Server Error",
            details: e.message,
        }, { status: 500 });
    }
}

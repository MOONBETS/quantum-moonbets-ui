// app/api/platform/addAdmin/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { getProgram } from "@/lib/solana/program";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { primaryAdmin, adminPublicKey } = body;

        if (!primaryAdmin || !adminPublicKey) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const primaryAdminPubkey = new PublicKey(primaryAdmin);
        const newAdminPubkey = new PublicKey(adminPublicKey);

        const program = getProgram();

        const [adminPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("admin"), newAdminPubkey.toBuffer()],
            program.programId
        );

        const [platformStats] = PublicKey.findProgramAddressSync(
            [Buffer.from("platform_stats")],
            program.programId
        );

        const ix = await program.methods
            .removeAdmin()
            .accountsStrict({
                primaryAdmin: primaryAdminPubkey,
                platformStats,
                admin: adminPda,
            })
            .instruction();

        const { blockhash } = await program.provider.connection.getLatestBlockhash();
        const tx = new Transaction().add(ix);
        tx.feePayer = primaryAdminPubkey;
        tx.recentBlockhash = blockhash;

        const serialized = tx.serialize({ requireAllSignatures: false });

        return NextResponse.json({
            transaction: Buffer.from(serialized).toString("base64"),
            adminPda: adminPda.toBase58(),
            platformStats: platformStats.toBase58(),
        });
    } catch (e: any) {
        console.error("Add admin error:", e);
        return NextResponse.json({ error: "Internal Server Error", details: e.message }, { status: 500 });
    }
}

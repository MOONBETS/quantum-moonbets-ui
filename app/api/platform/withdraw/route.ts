// app/api/platform/withdraw/route.ts
/**
 * Withdraw winnings from player's pending balance
 * Server handles the transaction, client signs and submits
 */

import { NextRequest, NextResponse } from "next/server";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { getProgram } from "@/lib/solana/program";

export async function POST(req: NextRequest) {
    try {
        console.log("Withdraw - request received");

        // Parse request body
        let body;
        try {
            body = await req.json();
            console.log("Request body parsed:", body);
        } catch (e) {
            console.error("Failed to parse request body:", e);
            return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
        }

        // Validate public key
        if (!body.publicKey) {
            console.error("No public key provided in request");
            return NextResponse.json({ error: "Public key is required" }, { status: 400 });
        }

        let userPubkey;
        try {
            userPubkey = new PublicKey(body.publicKey);
            console.log("User public key created:", userPubkey.toBase58());
        } catch (e) {
            console.error("Invalid public key format:", e);
            return NextResponse.json({ error: "Invalid public key format" }, { status: 400 });
        }

        // Get program instance
        let program;
        try {
            program = getProgram();
            console.log("Program initialized with ID:", program.programId.toBase58());
        } catch (e: any) {
            console.error("Failed to load program:", e);
            return NextResponse.json({ error: "Failed to load Solana program", details: e.message }, { status: 500 });
        }

        // Derive PDAs
        let playerPda, platformVault, platformStats;
        try {
            [playerPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("playerd"), userPubkey.toBuffer()],
                program.programId
            );
            [platformVault] = PublicKey.findProgramAddressSync(
                [Buffer.from("platform_vault")],
                program.programId
            );
            [platformStats] = PublicKey.findProgramAddressSync(
                [Buffer.from("platform_stats")],
                program.programId
            );
            console.log("Derived PDAs:", {
                player: playerPda.toBase58(),
                vault: platformVault.toBase58(),
                stats: platformStats.toBase58(),
            });
        } catch (e) {
            console.error("Failed to derive PDAs:", e);
            return NextResponse.json({ error: "Failed to derive program addresses" }, { status: 500 });
        }

        // Create instruction
        let ix;
        try {
            ix = await program.methods
                .withdraw()
                .accountsStrict({
                    payer: userPubkey,
                    player: playerPda,
                    platformVault,
                    platformStats,
                    systemProgram: SystemProgram.programId,
                })
                .instruction();
            console.log("Withdrawal instruction created");
        } catch (e) {
            console.error("Failed to create withdraw instruction:", e);
            return NextResponse.json({ error: "Failed to create instruction" }, { status: 500 });
        }

        // Create transaction
        let tx, latestBlockhash;
        try {
            tx = new Transaction().add(ix);
            tx.feePayer = userPubkey;
            latestBlockhash = await program.provider.connection.getLatestBlockhash();
            tx.recentBlockhash = latestBlockhash.blockhash;
            console.log("Transaction built and blockhash set");
        } catch (e) {
            console.error("Failed to build transaction:", e);
            return NextResponse.json({ error: "Failed to build transaction" }, { status: 500 });
        }

        // Serialize and return
        let serialized;
        try {
            serialized = tx.serialize({ requireAllSignatures: false });
            console.log("Transaction serialized");
        } catch (e) {
            console.error("Failed to serialize transaction:", e);
            return NextResponse.json({ error: "Failed to serialize transaction" }, { status: 500 });
        }

        return NextResponse.json({
            transaction: Buffer.from(serialized).toString("base64"),
            playerPda: playerPda.toBase58(),
        });

    } catch (e: any) {
        console.error("Unexpected error in withdraw route:", e);
        return NextResponse.json({
            error: "Internal Server Error",
            details: e.message,
        }, { status: 500 });
    }
}

// app/api/platform/initializePlayer/route.ts
/**
 * Initialize a new player account
 * Server creates the transaction, client signs and submits it
 */

import { NextRequest, NextResponse } from "next/server";
import { SystemProgram, Transaction, PublicKey } from "@solana/web3.js";
import { getProgram } from "@/lib/solana/program";

export async function POST(req: NextRequest) {
    try {
        console.log("Initializing player - request received");

        // Parse the request body
        let body;
        try {
            body = await req.json();
            console.log("Request body parsed:", body);
        } catch (e) {
            console.error("Failed to parse request body:", e);
            return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
        }

        // Check public key
        if (!body.publicKey) {
            console.error("No public key provided in request");
            return NextResponse.json({ error: "Public key is required" }, { status: 400 });
        }

        // Create public key object
        let userPubkey;
        try {
            userPubkey = new PublicKey(body.publicKey);
            console.log("User public key created:", userPubkey.toString());
        } catch (e) {
            console.error("Invalid public key:", e);
            return NextResponse.json({ error: "Invalid public key format" }, { status: 400 });
        }

        // Get program using the server-compatible function
        let program;
        try {
            program = getProgram();
            console.log("Server program fetched, ID:", program?.programId.toString());
        } catch (e: any) {
            console.error("Failed to get program:", e);
            return NextResponse.json({
                error: "Failed to initialize Solana program",
                details: e.message
            }, { status: 500 });
        }

        // Generate player PDA
        let playerPda;
        try {
            [playerPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("playerd"), userPubkey.toBuffer()],
                program.programId
            );
            console.log("Player PDA created:", playerPda.toString());
        } catch (e) {
            console.error("Failed to create player PDA:", e);
            return NextResponse.json({ error: "Failed to create player program address" }, { status: 500 });
        }

        // Create instruction
        let ix;
        try {
            ix = await program.methods
                .initializePlayer()
                .accountsStrict({
                    payer: userPubkey,
                    player: playerPda,
                    systemProgram: SystemProgram.programId,
                })
                .instruction();
            console.log("Instruction created");
        } catch (e) {
            console.error("Failed to create instruction:", e);
            return NextResponse.json({ error: "Failed to create instruction" }, { status: 500 });
        }

        // Create and set up transaction
        let tx, latestBlockhash;
        try {
            tx = new Transaction().add(ix);
            tx.feePayer = userPubkey;

            latestBlockhash = await program.provider.connection.getLatestBlockhash();
            console.log("Latest blockhash fetched:", latestBlockhash.blockhash);
            tx.recentBlockhash = latestBlockhash.blockhash;
        } catch (e) {
            console.error("Failed to create transaction:", e);
            return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
        }

        // Serialize transaction
        let serialized;
        try {
            serialized = tx.serialize({ requireAllSignatures: false });
            console.log("Transaction serialized successfully");
        } catch (e) {
            console.error("Failed to serialize transaction:", e);
            return NextResponse.json({ error: "Failed to serialize transaction" }, { status: 500 });
        }

        // Return successful response
        console.log("Returning transaction to client");
        return NextResponse.json({
            transaction: Buffer.from(serialized).toString('base64'),
            playerPda: playerPda.toString()
        });
    } catch (e: any) {
        console.error("Player initialization failed with error:", e);
        console.error("Error stack:", e.stack);
        return NextResponse.json({
            error: "Internal Server Error",
            details: e.message
        }, { status: 500 });
    }
}
// Enhanced route.ts with better error logging
// app/api/solana/initializePlatform/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getProgram } from "@/lib/solana/program";
import { SystemProgram, Transaction, PublicKey } from "@solana/web3.js";

export async function POST(req: NextRequest) {
    try {
        // Add detailed logging to help diagnose where the error occurs
        console.log("Initializing platform - request received");

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

        // Create public key object with error handling
        let userPubkey;
        try {
            userPubkey = new PublicKey(body.publicKey);
            console.log("User public key created:", userPubkey.toString());
        } catch (e) {
            console.error("Invalid public key:", e);
            return NextResponse.json({ error: "Invalid public key format" }, { status: 400 });
        }

        // Get program with error handling
        let program;
        try {
            program = getProgram();
            console.log("Program fetched, ID:", program?.programId.toString());
        } catch (e) {
            console.error("Failed to get program:", e);
            return NextResponse.json({ error: "Failed to initialize Solana program" }, { status: 500 });
        }

        if (!program) {
            console.error("Program not initialized");
            return NextResponse.json({ error: "Program not initialized" }, { status: 400 });
        }

        // Create PDAs with error handling
        let adminPda, platformStats, platformVault;
        try {
            [adminPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("admin"), userPubkey.toBuffer()],
                program.programId
            );
            console.log("Admin PDA created:", adminPda.toString());

            [platformStats] = PublicKey.findProgramAddressSync(
                [Buffer.from("platform_stats")],
                program.programId
            );
            console.log("Platform stats PDA created:", platformStats.toString());

            [platformVault] = PublicKey.findProgramAddressSync(
                [Buffer.from("platform_vault")],
                program.programId
            );
            console.log("Platform vault PDA created:", platformVault.toString());
        } catch (e) {
            console.error("Failed to create PDAs:", e);
            return NextResponse.json({ error: "Failed to create program addresses" }, { status: 500 });
        }

        // Create instruction with error handling
        let ix;
        try {
            ix = await program.methods
                .initializePlatform()
                .accountsStrict({
                    admin: userPubkey,
                    platformStats,
                    platformVault,
                    adminAccount: adminPda,
                    systemProgram: SystemProgram.programId,
                })
                .instruction();
            console.log("Instruction created");
        } catch (e) {
            console.error("Failed to create instruction:", e);
            return NextResponse.json({ error: "Failed to create instruction" }, { status: 500 });
        }

        // Create and set up transaction with error handling
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

        // Serialize transaction with error handling
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
        });
    } catch (e: any) {
        // Log full error details for debugging
        console.error("Initialization failed with error:", e);
        console.error("Error stack:", e.stack);
        return NextResponse.json({
            error: "Internal Server Error",
            details: process.env.NODE_ENV === 'development' ? e.message : undefined
        }, { status: 500 });
    }
}
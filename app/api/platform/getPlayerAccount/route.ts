/**
 * Get the player account data
 * Server derives the PDA from user's public key and fetches account info
 */

import { NextRequest, NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import { getProgram } from "@/lib/solana/program";

export async function POST(req: NextRequest) {
    try {
        console.log("GetPlayerAccount - request received");

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
            console.log("User public key created:", userPubkey.toString());
        } catch (e) {
            console.error("Invalid public key format:", e);
            return NextResponse.json({ error: "Invalid public key format" }, { status: 400 });
        }

        // Get program instance
        let program;
        try {
            program = getProgram();
            console.log("Server program fetched, ID:", program?.programId.toString());
        } catch (e: any) {
            console.error("Failed to get program:", e);
            return NextResponse.json({ error: "Failed to initialize Solana program", details: e.message }, { status: 500 });
        }

        // Derive player PDA (NOTE: use correct seed here)
        let playerPda;
        try {
            [playerPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("player"), userPubkey.toBuffer()], // or "playerd" if that’s your actual seed
                program.programId
            );
            console.log("Player PDA derived:", playerPda.toBase58());
        } catch (e) {
            console.error("Failed to derive PDA:", e);
            return NextResponse.json({ error: "Failed to derive PDA" }, { status: 500 });
        }

        // Fetch player account data
        let accountData;
        try {
            accountData = await program.account.player.fetch(playerPda);
            console.log("Player account fetched:", accountData);
        } catch (e) {
            console.error("Failed to fetch player account:", e);
            return NextResponse.json({ error: "Failed to fetch player account" }, { status: 500 });
        }

        // Return player account info
        return NextResponse.json({
            playerPda: playerPda.toBase58(),
            playerAccount: accountData,
        });

    } catch (e: any) {
        console.error("Unexpected error in getPlayerAccount:", e);
        return NextResponse.json({
            error: "Internal Server Error",
            details: e.message,
        }, { status: 500 });
    }
}

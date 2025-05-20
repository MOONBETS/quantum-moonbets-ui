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
            // console.log("Request body parsed:", body);
        } catch (e) {
            console.error("Failed to parse request body:", e);
            return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
        }

        // Validate public key
        if (!body.playerPda) {
            console.error("No player pda provided in request");
            return NextResponse.json({ error: "Public key is required" }, { status: 400 });
        }

        let playerPda;
        try {
            playerPda = new PublicKey(body.playerPda);
        } catch (e) {
            console.error("Invalid public key format:", e);
            return NextResponse.json({ error: "Invalid public key format" }, { status: 400 });
        }

        // Get program instance
        let program;
        program = getProgram();

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

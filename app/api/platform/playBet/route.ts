// app/api/platform/playBet/route.ts
/**
 * API route for players to place bets
 * Server creates the transaction, client signs and submits it
 */
import { NextRequest, NextResponse } from "next/server";
import { Transaction, PublicKey } from "@solana/web3.js";
import { getProgram, platformStats, platformVault } from "@/lib/solana/program";
import { BN } from "@coral-xyz/anchor";

// Optional: Define types for better type safety
interface PlayBetRequest {
    publicKey: string;
    betAmount: string | number;  // In lamports
    quantum_noise: number;  // 1-6, optional
    particlesResolved: number
}

export async function POST(req: NextRequest) {
    try {
        console.log("Play bet request received");

        // Parse the request body
        let body: PlayBetRequest;
        try {
            body = await req.json();

            // Validate essential fields
            if (!body.publicKey) {
                return NextResponse.json({ error: "Public key is required" }, { status: 400 });
            }

            if (!body.betAmount) {
                return NextResponse.json({ error: "Bet amount is required" }, { status: 400 });
            }
        } catch (e) {
            console.error("Failed to parse request body:", e);
            return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
        }

        // Process and validate inputs
        let userPubkey: PublicKey;
        let betAmount: BN;
        let particlesResolved: number;
        let quantumNoise: BN;

        try {
            // Parse public key
            userPubkey = new PublicKey(body.publicKey);

            // Parse bet amount (convert to BN)
            betAmount = new BN(body.betAmount.toString());
            if (betAmount.ltn(0)) {
                return NextResponse.json({ error: "Bet amount must be positive" }, { status: 400 });
            }

            // Parse bet choice (or use random)
            quantumNoise = body.quantum_noise || Math.floor(Math.random() * 6) + 1;

            particlesResolved = body.particlesResolved;

        } catch (e) {
            console.error("Input validation failed:", e);
            return NextResponse.json({ error: "Invalid input parameters" }, { status: 400 });
        }

        // Get program and PDAs
        let program, playerPda, programIdentityPubkey, oracleQueue, vrfProgramAddress;
        try {
            program = getProgram();

            // Generate player PDA
            [playerPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("playerd"), userPubkey.toBuffer()],
                program.programId
            );

            // Get program identity pubkey
            [programIdentityPubkey] = PublicKey.findProgramAddressSync(
                [Buffer.from("identity")],
                program.programId
            );
            // console.log("Program identity:", programIdentityPubkey.toString());

            // Setup VRF oracle queue
            oracleQueue = new PublicKey("Cuj97ggrhhidhbu39TijNVqE74xvKJ69gDervRUXAxGh");

            // VRF Program Address (replace with actual address if different)
            // Note: You may need to adjust this if you're using a specific VRF program
            vrfProgramAddress = new PublicKey("Vrf1RNUjXmQGjmQrQLvJHs9SNkvDJEsRVFPkfSQUwGz");
            // console.log("VRF Program Address:", vrfProgramAddress.toString());

        } catch (e: any) {
            console.error("Failed to setup program and accounts:", e);
            return NextResponse.json({
                error: "Failed to setup program and accounts",
                details: e.message
            }, { status: 500 });
        }

        // Get player account before bet
        const playerBefore = await program.account.player.fetch(playerPda);

        // Create the instruction
        let ix;
        try {
            ix = await program.methods
                .play(
                    quantumNoise, betAmount, particlesResolved
                )
                .accountsPartial({
                    payer: userPubkey,
                    player: playerPda,
                    platformVault: platformVault,
                    platformStats: platformStats
                })
                .instruction();

            // console.log("Play instruction created");
        } catch (e) {
            console.error("Failed to create play instruction:", e);
            return NextResponse.json({ error: "Failed to create play instruction" }, { status: 500 });
        }

        // Create and set up transaction
        let tx, latestBlockhash;
        try {
            tx = new Transaction().add(ix);
            tx.feePayer = userPubkey;

            latestBlockhash = await program.provider.connection.getLatestBlockhash();
            // console.log("Latest blockhash fetched:", latestBlockhash.blockhash);
            tx.recentBlockhash = latestBlockhash.blockhash;
        } catch (e) {
            console.error("Failed to create transaction:", e);
            return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
        }

        // Serialize transaction
        const serialized = tx.serialize({ requireAllSignatures: false });

        // Return response with transaction and parameters
        return NextResponse.json({
            transaction: Buffer.from(serialized).toString('base64'),
            oldPlayer: playerBefore
        });
    } catch (e: any) {
        console.error("Play bet failed with error:", e);
        console.error("Error stack:", e.stack);
        return NextResponse.json({
            error: "Internal Server Error",
            details: e.message
        }, { status: 500 });
    }
}

// Create a new file: lib/solana/serverProgram.ts
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import idl from "@/app/moonbets.json";
import { MoonbetsProgram } from "@/app/types/program";

// Create a read-only provider for server-side operations
export function getProgram() {
    // Use environment variables for connection (or default to localhost)
    const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://hidden-broken-yard.solana-mainnet.quiknode.pro/7fef0c379b4a84c33cf93ab6d9ada7a5916eba9b";
    const connection = new Connection(rpcUrl, "confirmed");

    // Create a dummy wallet for read-only operations
    // Note: This wallet can't sign transactions, but is sufficient for creating instructions
    const dummyWallet = {
        publicKey: Keypair.generate().publicKey,
        signTransaction: () => Promise.reject(new Error("This is a read-only wallet")),
        signAllTransactions: () => Promise.reject(new Error("This is a read-only wallet")),
    };

    // Create AnchorProvider with the dummy wallet
    const provider = new AnchorProvider(connection, dummyWallet as any, {
        commitment: "confirmed",
        preflightCommitment: "confirmed",
    });

    // Create and return the program instance
    return new Program(idl, provider) as MoonbetsProgram;
}
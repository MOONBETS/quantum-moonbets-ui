// Create a new file: lib/solana/serverProgram.ts
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import idl from "@/app/moonbets.json";
import { MoonbetsProgram } from "@/app/types/program";

const secret = [
];
const dummyKeypair = Keypair.fromSecretKey(new Uint8Array(secret));

// Use static RPC URL from environment or fallback
const rpcUrl =
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
    "https://hidden-broken-yard.solana-mainnet.quiknode.pro/7fef0c379b4a84c33cf93ab6d9ada7a5916eba9b";

// Shared connection across server
const connection = new Connection(rpcUrl, "confirmed");

// Dummy wallet that can build but not sign transactions
const dummyWallet = {
    publicKey: dummyKeypair.publicKey,
    signTransaction: async () => {
        throw new Error("This is a read-only wallet");
    },
    signAllTransactions: async () => {
        throw new Error("This is a read-only wallet");
    },
};

// Anchor provider and program — created only once
const provider = new AnchorProvider(connection, dummyWallet as any, {
    commitment: "confirmed",
    preflightCommitment: "confirmed",
});

const program = new Program(idl, provider) as MoonbetsProgram;

const [platformStats] = PublicKey.findProgramAddressSync(
    [Buffer.from("platform_stats")],
    program.programId
);
console.log("Platform stats PDA created:", platformStats.toString());

const [platformVault] = PublicKey.findProgramAddressSync(
    [Buffer.from("platform_vault")],
    program.programId
);

export function getProgram(): MoonbetsProgram {
    return program;
}

export function getConnection(): Connection {
    return connection;
}

const adminKeypair = dummyKeypair;

export { platformStats, platformVault, adminKeypair };

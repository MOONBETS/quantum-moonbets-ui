// api/solana/balance.ts
import { NextRequest } from 'next/server';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

const connection = new Connection("https://hidden-broken-yard.solana-mainnet.quiknode.pro/7fef0c379b4a84c33cf93ab6d9ada7a5916eba9b");

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) {
        return new Response(JSON.stringify({ error: 'Missing wallet address' }), {
            status: 400,
        });
    }

    try {
        const publicKey = new PublicKey(wallet);
        const lamports = await connection.getBalance(publicKey);
        const sol = lamports / 1e9;

        return new Response(JSON.stringify({ sol }), {
            status: 200,
        });
    } catch (err) {
        console.error(err);
        return new Response(JSON.stringify({ error: 'Failed to fetch balance' }), {
            status: 500,
        });
    }
}

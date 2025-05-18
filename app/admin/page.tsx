"use client";

import { useEffect, useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { AnchorProvider, BN, Program, web3 } from "@coral-xyz/anchor";
import idl from "../moonbets.json";
import { MoonbetsProgram } from "../types/program";
import { PlatformStats } from "../types/accounts";
import { toast } from "react-hot-toast";
import MoonBackground from "@/components/moon-background";
import { TransactionService } from "../services/transactions";

const LAMPORTS_PER_SOL = 1000000000;

export default function AdminPage() {
  const { connection } = useConnection();
  const { publicKey, signTransaction, signAllTransactions } = useWallet();

  const [program, setProgram] = useState<MoonbetsProgram | null>(null);
  const [transactionService, setTransactionService] =
    useState<TransactionService | null>(null);
  const [platformStatsList, setPlatformStatsList] = useState<PlatformStats[]>(
    []
  );
  const [depositAmount, setDepositAmount] = useState("1");
  const [withdrawAmount, setWithdrawAmount] = useState("1");
  const [platformBalance, setPlatformBalance] = useState<number>(0);
  const [platformVault, setPlatformVault] = useState<web3.PublicKey | null>(
    null
  );

  useEffect(() => {
    if (!publicKey) return;

    const provider = new AnchorProvider(
      connection,
      { publicKey, signTransaction, signAllTransactions } as any,
      { commitment: "confirmed" }
    );

    const prog = new Program(idl, provider) as MoonbetsProgram;
    setProgram(prog);

    (async () => {
      try {
        const stats = await prog.account.platformStats.all();
        if (stats.length === 0) {
          toast("No stats found. Admin must initialize.");
        } else {
          setPlatformStatsList(stats.map((a) => a.account));

          // Use the platform vault public key from the account data
          const vaultPubkey = new web3.PublicKey(
            "7rvuZ9MUiFAvWHdrU68jKyFKw7r3VBapotEMjTRnFrUa"
          );
          setPlatformVault(vaultPubkey);

          const txService = new TransactionService(
            prog,
            web3.PublicKey.default, // Not used in admin context
            publicKey,
            stats[0].publicKey,
          );
          setTransactionService(txService);

          const balance = await connection.getBalance(vaultPubkey);
          setPlatformBalance(balance / LAMPORTS_PER_SOL);
        }
      } catch (error) {
        console.error("Error loading platform stats:", error);
        toast.error("Failed to load platform data");
      }
    })();
  }, [connection, publicKey]);

  const loadAllPlatformStats = async (prog: MoonbetsProgram) => {
    try {
      const accounts = await prog.account.platformStats.all();
      setPlatformStatsList(accounts.map((a) => a.account));

      if (accounts.length > 0 && platformVault) {
        const balance = await connection.getBalance(platformVault);
        setPlatformBalance(balance / LAMPORTS_PER_SOL);
      }
    } catch (e) {
      console.error("Failed to load platform stats:", e);
    }
  };

  const initializePlatform = async () => {
    if (!program || !publicKey) return;
    try {
      const platformStatsKeypair = web3.Keypair.generate();
      await program.methods
        .initializePlatform()
        .accounts({
          admin: publicKey,
          platformStats: platformStatsKeypair.publicKey,
        })
        .signers([platformStatsKeypair])
        .rpc();

      toast.success("Platform initialized successfully");
      await loadAllPlatformStats(program);
    } catch (e) {
      console.error("Failed to initialize platform:", e);
      toast.error("Failed to initialize platform: " + (e as Error).message);
    }
  };

  const handleDeposit = async () => {
    if (!transactionService || !program) {
      toast.error("Transaction service not initialized");
      return;
    }

    try {
      const amount = Number(depositAmount);
      if (isNaN(amount) || amount <= 0) {
        toast.error("Please enter a valid deposit amount");
        return;
      }

      const lamports = new BN(amount * LAMPORTS_PER_SOL);
      await transactionService.adminDeposit(lamports);
      toast.success("Deposit successful");
      await loadAllPlatformStats(program);
    } catch (e) {
      console.error("Deposit failed:", e);
      toast.error("Deposit failed: " + (e as Error).message);
    }
  };

  const handleWithdraw = async () => {
    if (!transactionService || !program) {
      toast.error("Transaction service not initialized");
      return;
    }

    try {
      const amount = Number(withdrawAmount);
      if (isNaN(amount) || amount <= 0) {
        toast.error("Please enter a valid withdrawal amount");
        return;
      }

      const lamports = new BN(amount * LAMPORTS_PER_SOL);
      await transactionService.adminWithdraw(lamports);
      toast.success("Withdrawal successful");
      await loadAllPlatformStats(program);
    } catch (e) {
      console.error("Withdrawal failed:", e);
      toast.error("Withdrawal failed: " + (e as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] to-[#1a1a3a] text-white overflow-hidden relative flex flex-col">
      <MoonBackground />

      <div className="mt-20 space-y-8 max-w-2xl mx-auto p-4 z-10">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Admin Panel 🛠️</h1>
          <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700 !text-white" />
        </div>

        {platformStatsList.length === 0 ? (
          <div className="bg-[#121232] p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">
              Platform Not Initialized
            </h2>
            <button
              onClick={initializePlatform}
              className="bg-blue-600 px-4 py-2 text-white rounded hover:bg-blue-700"
            >
              Initialize Platform
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-[#121232] p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Platform Stats</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400">Platform Balance</p>
                  <p className="font-medium">
                    {platformBalance.toFixed(4)} SOL
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Withdrawn Today</p>
                  <p className="font-medium">
                    {platformStatsList[0]?.withdrawnToday
                      ? (
                          platformStatsList[0].withdrawnToday.toNumber() /
                          LAMPORTS_PER_SOL
                        ).toFixed(4)
                      : "0.0000"}{" "}
                    SOL
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#121232] p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Deposit</h3>
                <input
                  type="text"
                  pattern="[0-9]*\.?[0-9]*"
                  min="0.001"
                  step="0.001"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="bg-[#1a1a3a] border border-blue-800 px-2 py-1 rounded w-full text-white"
                />
                <button
                  onClick={handleDeposit}
                  disabled={!transactionService}
                  className="bg-green-600 px-4 py-2 text-white rounded w-full hover:bg-green-700 mt-2 disabled:bg-green-800 disabled:opacity-50"
                >
                  Deposit SOL
                </button>
              </div>

              <div className="bg-[#121232] p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Withdraw</h3>
                <input
                  type="text"
                  pattern="[0-9]*\.?[0-9]*"
                  min="0.001"
                  step="0.001"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="bg-[#1a1a3a] border border-red-800 px-2 py-1 rounded w-full text-white"
                />
                <button
                  onClick={handleWithdraw}
                  disabled={!transactionService}
                  className="bg-red-600 px-4 py-2 text-white rounded w-full hover:bg-red-700 mt-2 disabled:bg-red-800 disabled:opacity-50"
                >
                  Withdraw SOL
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

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
  const [txService, settxService] =
    useState<TransactionService | null>(null);
  const [platformStatsList, setPlatformStatsList] = useState<PlatformStats[]>([]);
  const [depositAmount, setDepositAmount] = useState("1");
  const [withdrawAmount, setWithdrawAmount] = useState("1");
  const [platformBalance, setPlatformBalance] = useState<number>(0);
  const [platformVault, setPlatformVault] = useState<web3.PublicKey | null>(null);
  const [adminPubkeyInput, setAdminPubkeyInput] = useState("");

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

          const [vaultPda, vaultBump] = web3.PublicKey.findProgramAddressSync(
                [Buffer.from("platform_vault")],
                prog.programId
              );

          setPlatformVault(vaultPda);

          const trxService = new TransactionService(
            prog,
            web3.PublicKey.default,
            publicKey,
            stats[0].publicKey
          );
          settxService(trxService);

          const balance = await connection.getBalance(vaultPda);
          setPlatformBalance(balance / LAMPORTS_PER_SOL);
        }
      } catch (error) {
        console.error("Error loading platform stats:", error);
        toast.error("Failed to load platform data");
      }
    })();
  }, [connection, publicKey]);

  const initializePlatform = async () => {
    if (!program || !publicKey) return;
    try {
      await txService?.initializePlatform(web3.Keypair.generate())
      const stats = await txService?.loadPlatformStats();
      setPlatformStatsList(stats ?? [])
    } catch (e) {
      console.error("Failed to initialize platform:", e);
      toast.error("Failed to initialize platform: " + (e as Error).message);
    }
  };

  const handleDeposit = async () => {
    if (!txService || !program) {
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
      await txService.adminDeposit(lamports);
      toast.success("Deposit successful");
      const stats = await txService?.loadPlatformStats();
      setPlatformStatsList(stats ?? []);
    } catch (e) {
      console.error("Deposit failed:", e);
      toast.error("Deposit failed: " + (e as Error).message);
    }
  };

  const handleWithdraw = async () => {
    if (!txService || !program) {
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
      await txService.adminWithdraw(lamports);
      toast.success("Withdrawal successful");
      const stats = await txService?.loadPlatformStats();
      setPlatformStatsList(stats ?? [])
    } catch (e) {
      console.error("Withdrawal failed:", e);
      toast.error("Withdrawal failed: " + (e as Error).message);
    }
  };

  const handleAddAdmin = async () => {
    if (!txService || !adminPubkeyInput) return;

    try {
      const newAdmin = new web3.PublicKey(adminPubkeyInput);
      await txService.addAdmin(newAdmin);
      toast.success("Admin added successfully");
      const stats = await txService?.loadPlatformStats();
      setPlatformStatsList(stats ?? [])
    } catch (e) {
      console.error("Failed to add admin:", e);
      toast.error("Failed to add admin: " + (e as Error).message);
    }
  };

  const handleRemoveAdmin = async () => {
    if (!txService || !adminPubkeyInput) return;

    try {
      const adminToRemove = new web3.PublicKey(adminPubkeyInput);
      await txService.removeAdmin(adminToRemove);
      toast.success("Admin removed successfully");
      const stats = await txService?.loadPlatformStats();
      setPlatformStatsList(stats ?? [])
    } catch (e) {
      console.error("Failed to remove admin:", e);
      toast.error("Failed to remove admin: " + (e as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] to-[#1a1a3a] text-white overflow-hidden relative flex flex-col">
      <MoonBackground />

      <div className="mt-20 space-y-8 max-w-3xl mx-auto p-4 z-10">
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
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="bg-[#1a1a3a] border border-blue-800 px-2 py-1 rounded w-full text-white"
                />
                <button
                  onClick={handleDeposit}
                  className="bg-green-600 px-4 py-2 text-white rounded w-full hover:bg-green-700 mt-2"
                >
                  Deposit SOL
                </button>
              </div>

              <div className="bg-[#121232] p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Withdraw</h3>
                <input
                  type="text"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="bg-[#1a1a3a] border border-red-800 px-2 py-1 rounded w-full text-white"
                />
                <button
                  onClick={handleWithdraw}
                  className="bg-red-600 px-4 py-2 text-white rounded w-full hover:bg-red-700 mt-2"
                >
                  Withdraw SOL
                </button>
              </div>
            </div>

            <div className="bg-[#121232] p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Manage Admins</h3>
              <input
                type="text"
                placeholder="Enter admin public key"
                value={adminPubkeyInput}
                onChange={(e) => setAdminPubkeyInput(e.target.value)}
                className="bg-[#1a1a3a] border border-gray-700 px-2 py-1 rounded w-full text-white mb-2"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddAdmin}
                  className="bg-purple-600 px-4 py-2 text-white rounded hover:bg-purple-700 w-full"
                >
                  Add Admin
                </button>
                <button
                  onClick={handleRemoveAdmin}
                  className="bg-yellow-600 px-4 py-2 text-white rounded hover:bg-yellow-700 w-full"
                >
                  Remove Admin
                </button>
              </div>
            </div>

            {/* <div className="bg-[#121232] p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Current Admins</h3>
              {platformStatsList[0]?.adminCount ? (
                <ul className="list-disc ml-6 space-y-1 text-sm text-gray-300">
                  {platformStatsList[0]..map((admin, i) => (
                    <li key={i}>{admin.toBase58()}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No admins listed.</p>
              )}
            </div> */}
          </div>
        )}
      </div>
    </div>
  );
}

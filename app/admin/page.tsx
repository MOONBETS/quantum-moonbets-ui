"use client";

import { useEffect, useRef, useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { BN, web3 } from "@coral-xyz/anchor";
import idl from "../moonbets.json";
import { PlatformStats } from "../types/accounts";
import { toast } from "react-hot-toast";
import MoonBackground from "@/components/moon-background";
import { PublicKey, Transaction } from "@solana/web3.js";

const LAMPORTS_PER_SOL = 1000000000;

export default function AdminPage() {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();
  const [platformStatsList, setPlatformStatsList] = useState<PlatformStats[]>([]);
  const [depositAmount, setDepositAmount] = useState("1");
  const [withdrawAmount, setWithdrawAmount] = useState("1");
  const [platformBalance, setPlatformBalance] = useState<number>(0);
  const [adminPubkeyInput, setAdminPubkeyInput] = useState("");
  
  const safeParseAmount = (value: any): number => {
    if (!value) return 0;
    
    // Handle BN objects
    if (typeof value.toNumber === 'function') {
      return value.toNumber() / LAMPORTS_PER_SOL;
    }
    
    // Handle string numbers
    if (typeof value === 'string') {
      // Remove leading zeros to avoid octal interpretation issues
      const cleanValue = value.replace(/^0+/, '') || '0';
      return parseInt(cleanValue, 10) / LAMPORTS_PER_SOL;
    }
    
    // Handle plain numbers
    if (typeof value === 'number') {
      return value / LAMPORTS_PER_SOL;
    }
    
    // Default fallback
    return 0;
  };

  const getBalance = async (wallet: string) => {
    const res = await fetch(`/api/solana/balance?wallet=${wallet}`);
    const data = await res.json();
    console.log("balance data:", data)
    return data.sol;
  };

  const getplatformStats = async () => {
    const res = await fetch(`/api/platform/stats`);
    const data = await res.json();
    console.log("getplatformStats:", data)
    return data;
  };

  const getplatformBalance = async () => {
    const res = await fetch(`/api/platform/balance`);
    const data = await res.json();
    console.log("getplatformBalance:", data)
    return data;
  };


  useEffect(() => {
    if (!publicKey) return;
    const programId =  new PublicKey(idl.address);

    (async () => {
      try {
        const [vaultPda] = web3.PublicKey.findProgramAddressSync(
          [Buffer.from("platform_vault")],
          programId
        );

        console.log("GEtting stats...");
        const stats = await getplatformStats();
        console.log("stats...:", stats);
        if (stats.length === 0) {
          toast("No stats found. Admin must initialize.");
        } else {
          setPlatformStatsList(stats ?? []);
          const balance = await getBalance(vaultPda.toBase58());
          setPlatformBalance(balance);
        }
      } catch (error) {
        console.error("Error loading platform stats:", error);
        toast.error("Failed to load platform data");
      }
    })();
  }, [connection, publicKey]);
  
  // 2. Updated client-side initialization function
  // Updated client-side initialization function with detailed error handling
  const initializePlatform = async () => {
    if (!publicKey || !signTransaction) {
        toast.error("Wallet not connected");
        return;
    }

    try {
        const res = await fetch("/api/solana/initializePlatform", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ publicKey: publicKey.toBase58() }),
        });

        // Handle HTTP errors
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            console.error("Server response:", errorData);
            throw new Error(`HTTP error! Status: ${res.status}. ${errorData.error || ''} ${errorData.details || ''}`);
        }

        const data = await res.json();
        // console.log("API response:", data);
        
        if (data.error) throw new Error(data.error);
        if (!data.transaction) throw new Error("No transaction returned");

        console.log("Deserializing and signing transaction...");
        const txBuffer = Buffer.from(data.transaction, "base64");
        const tx = Transaction.from(txBuffer);

        const signed = await signTransaction(tx);
        // console.log("Transaction signed, sending to network...");
        
        const sig = await connection.sendRawTransaction(signed.serialize());
        
        await connection.confirmTransaction(sig, "confirmed");
        // console.log("Transaction confirmed!");

        toast.success("Platform initialized successfully");
    } catch (err: any) {
        console.error("Failed to initialize platform:", err);
        toast.error(`Initialization failed: ${err.message}`);
    }
  };

  const handleDeposit = async () => {
    try {
      if (!publicKey || !signTransaction || !depositAmount) {
        throw new Error("Wallet not connected or cannot sign");
      }

      const amount = Number(depositAmount);

      if (isNaN(amount) || amount <= 0) {
        toast.error("Please enter a valid deposit amount");
        return;
      }

      const lamports = amount * LAMPORTS_PER_SOL;

      const res = await fetch("/api/platform/adminDeposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          admin: publicKey.toBase58(),
          amount: lamports.toString(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Admin deposit request failed");
      }

      const serializedTx = Buffer.from(data.transaction, "base64");
      const tx = Transaction.from(serializedTx);

      const signedTx = await signTransaction(tx);
      const txid = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(txid, "confirmed");

      console.log("Admin deposit successful:", txid);
      const stats = await getplatformStats();
      setPlatformStatsList(stats ?? [])
    } catch (e) {
      console.error("Deposit failed:", e);
      toast.error("Deposit failed: " + (e as Error).message);
    }
  };

  const handleWithdraw = async () => {
    try {
      if (!publicKey || !signTransaction || !withdrawAmount) {
        throw new Error("Wallet not connected or cannot sign");
      }

      const amount = Number(withdrawAmount);

      if (isNaN(amount) || amount <= 0) {
        toast.error("Please enter a valid deposit amount");
        return;
      }

      const lamports = amount * LAMPORTS_PER_SOL;

      const res = await fetch("/api/platform/adminWithdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          admin: publicKey.toBase58(),
          amount: lamports.toString(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Admin deposit request failed");
      }

      const serializedTx = Buffer.from(data.transaction, "base64");
      const tx = Transaction.from(serializedTx);

      const signedTx = await signTransaction(tx);
      const txid = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(txid, "confirmed");

      console.log("Admin deposit successful:", txid);
      const stats = await getplatformStats();
      setPlatformStatsList(stats ?? [])
    } catch (e) {
      console.error("Withdrawal failed:", e);
      toast.error("Withdrawal failed: " + (e as Error).message);
    }
  };

  const handleAddAdmin = async () => {
    try {
      if (!publicKey || !signTransaction || !adminPubkeyInput) {
        throw new Error("Wallet not connected or can't sign");
      }

      const res = await fetch("/api/platform/addAdmin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primaryAdmin: publicKey.toBase58(),
          newAdmin: adminPubkeyInput,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Add admin request failed");
      }

      const serializedTx = Buffer.from(data.transaction, "base64");
      const tx = Transaction.from(serializedTx);

      const signedTx = await signTransaction(tx);
      const txid = await connection.sendRawTransaction(signedTx.serialize());

      await connection.confirmTransaction(txid, "confirmed");

      console.log("Admin added with txid:", txid);
      // return {
      //   txid,
      //   adminPda: data.adminPda,
      //   platformStats: data.platformStats,
      // };
    } catch (e) {
      console.error("Failed to add admin:", e);
      toast.error("Failed to add admin: " + (e as Error).message);
    }
  };

  const handleRemoveAdmin = async () => {
    try {
      if (!publicKey || !signTransaction || !adminPubkeyInput) {
        throw new Error("Wallet not connected or can't sign");
      }

      const res = await fetch("/api/platform/removeAdmin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primaryAdmin: publicKey.toBase58(),
          adminPublicKey: adminPubkeyInput,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Remove admin request failed");
      }

      const serializedTx = Buffer.from(data.transaction, "base64");
      const tx = Transaction.from(serializedTx);

      const signedTx = await signTransaction(tx);
      const txid = await connection.sendRawTransaction(signedTx.serialize());

      await connection.confirmTransaction(txid, "confirmed");

      console.log("Admin removed with txid:", txid);
      // return {
      //   txid,
      //   adminPda: data.adminPda,
      //   platformStats: data.platformStats,
      // };
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
                      ? safeParseAmount(platformStatsList[0].withdrawnToday).toFixed(4)
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

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
import SuccessModal from "@/components/ui/SuccessModal";

const LAMPORTS_PER_SOL = 1000000000;

export default function AdminPage() {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();
  const [platformStatsList, setPlatformStatsList] = useState<PlatformStats[]>(
    []
  );
  const [depositAmount, setDepositAmount] = useState("1");
  const [withdrawAmount, setWithdrawAmount] = useState("1");
  const [platformBalance, setPlatformBalance] = useState<number>(0);
  const [adminPubkeyInput, setAdminPubkeyInput] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const safeParseAmount = (value: any): number => {
    // console.log("safeParseAmount value:", value);
    if (!value) return 0;

    // Handle BN objects
    if (typeof value.toNumber === "function") {
      return value.toNumber() / LAMPORTS_PER_SOL;
    }

    // Handle string numbers
    if (typeof value === "string") {
      // Remove leading zeros to avoid octal interpretation issues
      const cleanValue = value.replace(/^0+/, "") || "0";
      return parseInt(cleanValue, 10) / LAMPORTS_PER_SOL;
    }

    // Handle plain numbers
    if (typeof value === "number") {
      return value / LAMPORTS_PER_SOL;
    }

    // Default fallback
    return 0;
  };

  const safeParseNumber = (value: any): number => {
    if (!value) return 0;

    // If value is BN-like.
    if (typeof value.toNumber === "function") {
      return value.toNumber();
    }

    if (typeof value === "string") {
      // Check if the string is hexadecimal (contains letters a-f)
      const isHex = /^[0-9a-fA-F]+$/.test(value);
      const cleanValue = value.replace(/^0+/, "") || "0";
      return isHex ? parseInt(cleanValue, 16) : parseInt(cleanValue, 10);
    }

    if (typeof value === "number") {
      return value;
    }

    return 0;
  };

  const formatDate = (timestamp: any): string => {
    if (!timestamp) return "Never";

    let unixTimestamp = timestamp;
    if (typeof timestamp.toNumber === "function") {
      unixTimestamp = timestamp.toNumber();
    }

    return new Date(unixTimestamp * 1000).toLocaleDateString();
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const getBalance = async (wallet: string) => {
    const res = await fetch(`/api/solana/balance?wallet=${wallet}`);
    const data = await res.json();
    console.log("balance data:", data);
    return data.sol;
  };

  const getplatformStats = async () => {
    const res = await fetch(`/api/platform/stats`);
    const data = await res.json();
    console.log("getplatformStats:", data);
    return data;
  };

  const getplatformBalance = async () => {
    const res = await fetch(`/api/platform/balance`);
    const data = await res.json();
    console.log("getplatformBalance:", data);
    return data;
  };

  useEffect(() => {
    if (!publicKey) return;
    const programId = new PublicKey(idl.address);

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
          setPlatformBalance(balance || 0);
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
      const res = await fetch("/api/platform/initializePlatform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicKey: publicKey.toBase58() }),
      });

      // Handle HTTP errors
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("Server response:", errorData);
        throw new Error(
          `HTTP error! Status: ${res.status}. ${errorData.error || ""} ${
            errorData.details || ""
          }`
        );
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

      setSuccessMessage("Platform initialized successfully!");
      setShowSuccess(true);
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
      setSuccessMessage("Deposit successful!");
      setShowSuccess(true);

      // Refresh stats and balance
      const stats = await getplatformStats();
      setPlatformStatsList(stats ?? []);
      const programId = new PublicKey(idl.address);
      const [vaultPda] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("platform_vault")],
        programId
      );
      const balance = await getBalance(vaultPda.toBase58());
      setPlatformBalance(balance || 0);
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
        toast.error("Please enter a valid withdraw amount");
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
        throw new Error(data.error || "Admin withdraw request failed");
      }

      const serializedTx = Buffer.from(data.transaction, "base64");
      const tx = Transaction.from(serializedTx);

      const signedTx = await signTransaction(tx);
      const txid = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(txid, "confirmed");

      console.log("Admin withdraw successful:", txid);
      setSuccessMessage("Withdrawal successful!");
      setShowSuccess(true);

      // Refresh stats and balance
      const stats = await getplatformStats();
      setPlatformStatsList(stats ?? []);
      const programId = new PublicKey(idl.address);
      const [vaultPda] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("platform_vault")],
        programId
      );
      const balance = await getBalance(vaultPda.toBase58());
      setPlatformBalance(balance || 0);
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
      setSuccessMessage("Admin added successfully!");
      setShowSuccess(true);
      setAdminPubkeyInput("");

      // Refresh stats
      const stats = await getplatformStats();
      setPlatformStatsList(stats ?? []);
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
      setSuccessMessage("Admin removed successfully!");
      setShowSuccess(true);
      setAdminPubkeyInput("");

      // Refresh stats
      const stats = await getplatformStats();
      setPlatformStatsList(stats ?? []);
    } catch (e) {
      console.error("Failed to remove admin:", e);
      toast.error("Failed to remove admin: " + (e as Error).message);
    }
  };

  const currentStats = platformStatsList[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] to-[#1a1a3a] text-white overflow-hidden relative flex flex-col">
      <MoonBackground />

      <div className="mt-20 space-y-8 max-w-6xl mx-auto p-4 z-10">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Admin Panel 🛠️</h1>
          <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700 !text-white" />
        </div>
        <SuccessModal
          visible={showSuccess}
          message={successMessage}
          onClose={() => setShowSuccess(false)}
        />

        {platformStatsList.length === 0 ? (
          <div className="bg-[#121232] p-6 rounded-lg border border-blue-800">
            <h2 className="text-xl font-semibold mb-4 text-center">
              🚀 Platform Not Initialized
            </h2>
            <p className="text-gray-400 text-center mb-4">
              Initialize the platform to start tracking analytics and managing
              bets.
            </p>
            <div className="flex justify-center">
              <button
                onClick={initializePlatform}
                className="bg-blue-600 px-6 py-3 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Initialize Platform
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Platform Overview */}
            <div className="bg-[#121232] p-6 rounded-lg border border-blue-800">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                📊 Platform Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-[#1a1a3a] p-4 rounded-lg border border-green-600">
                  <p className="text-green-400 text-sm font-medium mb-1">
                    Platform Balance
                  </p>
                  <p className="text-2xl font-bold text-green-300">
                    {platformBalance.toFixed(4)} SOL
                  </p>
                </div>
                <div className="bg-[#1a1a3a] p-4 rounded-lg border border-blue-600">
                  <p className="text-blue-400 text-sm font-medium mb-1">
                    Total Users
                  </p>
                  <p className="text-2xl font-bold text-blue-300">
                    {formatNumber(safeParseNumber(currentStats?.totalUsers))}
                  </p>
                </div>
                <div className="bg-[#1a1a3a] p-4 rounded-lg border border-purple-600">
                  <p className="text-purple-400 text-sm font-medium mb-1">
                    Active Users
                  </p>
                  <p className="text-2xl font-bold text-purple-300">
                    {formatNumber(
                      safeParseNumber(currentStats?.currentActiveUsers)
                    )}
                  </p>
                </div>
                <div className="bg-[#1a1a3a] p-4 rounded-lg border border-yellow-600">
                  <p className="text-yellow-400 text-sm font-medium mb-1">
                    Admin Count
                  </p>
                  <p className="text-2xl font-bold text-yellow-300">
                    {safeParseNumber(currentStats?.adminCount)}
                  </p>
                </div>
              </div>
            </div>

            {/* Betting Analytics */}
            <div className="bg-[#121232] p-6 rounded-lg border border-blue-800">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                🎲 Betting Analytics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-[#1a1a3a] p-4 rounded-lg border border-orange-600">
                  <p className="text-orange-400 text-sm font-medium mb-1">
                    Total Bets
                  </p>
                  <p className="text-2xl font-bold text-orange-300">
                    {formatNumber(safeParseNumber(currentStats?.totalBets))}
                  </p>
                </div>
                <div className="bg-[#1a1a3a] p-4 rounded-lg border border-green-600">
                  <p className="text-green-400 text-sm font-medium mb-1">
                    Total Volume
                  </p>
                  <p className="text-2xl font-bold text-green-300">
                    {safeParseAmount(currentStats?.totalVolume).toFixed(2)} SOL
                  </p>
                </div>
                <div className="bg-[#1a1a3a] p-4 rounded-lg border border-cyan-600">
                  <p className="text-cyan-400 text-sm font-medium mb-1">
                    Max Bet Limit
                  </p>
                  <p className="text-2xl font-bold text-cyan-300">
                    {safeParseAmount(currentStats?.maxBetLamports).toFixed(2)}{" "}
                    SOL
                  </p>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-[#121232] p-6 rounded-lg border border-blue-800">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                💰 Financial Summary
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-[#1a1a3a] p-4 rounded-lg border border-green-600">
                  <p className="text-green-400 text-sm font-medium mb-1">
                    Total Profit
                  </p>
                  <p className="text-2xl font-bold text-green-300">
                    {safeParseAmount(currentStats?.totalProfit).toFixed(4)} SOL
                  </p>
                </div>
                <div className="bg-[#1a1a3a] p-4 rounded-lg border border-red-600">
                  <p className="text-red-400 text-sm font-medium mb-1">
                    Total Owed
                  </p>
                  <p className="text-2xl font-bold text-red-300">
                    {safeParseAmount(currentStats?.totalOwed).toFixed(4)} SOL
                  </p>
                </div>
                <div className="bg-[#1a1a3a] p-4 rounded-lg border border-orange-600">
                  <p className="text-orange-400 text-sm font-medium mb-1">
                    Withdrawn Today
                  </p>
                  <p className="text-2xl font-bold text-orange-300">
                    {safeParseAmount(currentStats?.withdrawnToday).toFixed(4)}{" "}
                    SOL
                  </p>
                </div>
                <div className="bg-[#1a1a3a] p-4 rounded-lg border border-purple-600">
                  <p className="text-purple-400 text-sm font-medium mb-1">
                    Daily Limit
                  </p>
                  <p className="text-2xl font-bold text-purple-300">
                    {safeParseAmount(currentStats?.dailyWithdrawLimit).toFixed(
                      2
                    )}{" "}
                    SOL
                  </p>
                </div>
              </div>
            </div>

            {/* System Information */}
            <div className="bg-[#121232] p-6 rounded-lg border border-blue-800">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                ⚙️ System Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#1a1a3a] p-4 rounded-lg border border-gray-600">
                  <p className="text-gray-400 text-sm font-medium mb-1">
                    Initialization Status
                  </p>
                  <p className="text-xl font-bold text-green-300">
                    {currentStats?.isInitialized
                      ? "✅ Initialized"
                      : "❌ Not Initialized"}
                  </p>
                </div>
                <div className="bg-[#1a1a3a] p-4 rounded-lg border border-gray-600">
                  <p className="text-gray-400 text-sm font-medium mb-1">
                    Last Reset
                  </p>
                  <p className="text-xl font-bold text-gray-300">
                    {formatDate(currentStats?.lastReset)}
                  </p>
                </div>
                <div className="bg-[#1a1a3a] p-4 rounded-lg border border-gray-600">
                  <p className="text-gray-400 text-sm font-medium mb-1">
                    Primary Admin
                  </p>
                  <p className="text-sm font-mono text-gray-300 break-all">
                    {currentStats?.primaryAdmin
                      ? currentStats.primaryAdmin.toString()
                      : "Not set"}
                  </p>
                </div>
                <div className="bg-[#1a1a3a] p-4 rounded-lg border border-gray-600">
                  <p className="text-gray-400 text-sm font-medium mb-1">
                    Daily Withdrawal Date
                  </p>
                  <p className="text-xl font-bold text-gray-300">
                    {formatDate(currentStats?.dailyWithdrawal?.date)}
                    <span className="text-sm text-gray-400 ml-2">
                      (
                      {safeParseAmount(
                        currentStats?.dailyWithdrawal?.amount
                      ).toFixed(4)}{" "}
                      SOL)
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Admin Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-[#121232] p-6 rounded-lg border border-blue-800">
                <h3 className="text-lg font-semibold mb-4">
                  💰 Treasury Management
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Deposit Amount (SOL)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="bg-[#1a1a3a] border border-green-800 px-3 py-2 rounded-lg w-full text-white focus:border-green-600 focus:outline-none"
                      placeholder="Enter SOL amount"
                    />
                    <button
                      onClick={handleDeposit}
                      className="bg-green-600 px-4 py-2 text-white rounded-lg w-full hover:bg-green-700 mt-2 transition-colors font-semibold"
                    >
                      💳 Deposit SOL
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Withdraw Amount (SOL)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="bg-[#1a1a3a] border border-red-800 px-3 py-2 rounded-lg w-full text-white focus:border-red-600 focus:outline-none"
                      placeholder="Enter SOL amount"
                    />
                    <button
                      onClick={handleWithdraw}
                      className="bg-red-600 px-4 py-2 text-white rounded-lg w-full hover:bg-red-700 mt-2 transition-colors font-semibold"
                    >
                      🏦 Withdraw SOL
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-[#121232] p-6 rounded-lg border border-blue-800">
                <h3 className="text-lg font-semibold mb-4">
                  👥 Admin Management
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Admin Public Key
                    </label>
                    <input
                      type="text"
                      placeholder="Enter admin public key"
                      value={adminPubkeyInput}
                      onChange={(e) => setAdminPubkeyInput(e.target.value)}
                      className="bg-[#1a1a3a] border border-gray-700 px-3 py-2 rounded-lg w-full text-white focus:border-blue-600 focus:outline-none font-mono text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddAdmin}
                      className="bg-purple-600 px-4 py-2 text-white rounded-lg hover:bg-purple-700 flex-1 transition-colors font-semibold"
                    >
                      ➕ Add Admin
                    </button>
                    <button
                      onClick={handleRemoveAdmin}
                      className="bg-yellow-600 px-4 py-2 text-white rounded-lg hover:bg-yellow-700 flex-1 transition-colors font-semibold"
                    >
                      ➖ Remove Admin
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

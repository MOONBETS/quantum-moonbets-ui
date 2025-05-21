"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BetProgressOverlay from "@/components/ui/BetProgressOverlay";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { RotateCcw, Coins } from "lucide-react";
import confetti from "canvas-confetti";
import MoonBackground from "@/components/moon-background";
import { cn } from "@/lib/utils";
import Footer from "@/components/footer";
import Header from "@/components/header";
import Particles from "@/components/particles";
import Stats from "@/components/bets-stats";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { AnchorProvider, Program, BN, web3 } from "@coral-xyz/anchor";
import idl from "./moonbets.json";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { MoonbetsProgram } from "./types/program";
import { Player } from "./types/accounts";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { toast } from "react-hot-toast";
import { DiceRolledEvent } from "./types/events";

export default function CasinoGame() {
  const [betAmount, setBetAmount] = useState(0.01);
  const [balance, setBalance] = useState(0);
  const [lastResults, setLastResults] = useState<Array<"win" | "lose">>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showResult, setShowResult] = useState<"win" | "lose" | null>(null);
  const { connection } = useConnection();
  const wallet = useWallet();
  const { publicKey, signTransaction, signAllTransactions, connected } = wallet;
  const [program, setProgram] = useState<MoonbetsProgram | null>(null);
  const [playerPda, setPlayerPda] = useState<PublicKey | null>(null);
  const [stats, setStats] = useState<Player | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showBetProgress, setShowBetProgress] = useState(false);


  const programID = new web3.PublicKey(idl.address);
  const COMMITMENT = "confirmed";

  const safeParseAmount = (value: any): number => {
    if (!value) return 0;

    // Handle BN objects
    if (typeof value.toNumber === 'function') {
      return value.toNumber() / LAMPORTS_PER_SOL;
    }

    // Handle string numbers
    if (typeof value === 'string') {
      let parsed = 0;

      // Detect hexadecimal (contains letters a-f or starts with 0x)
      if (/^[0-9a-f]+$/i.test(value)) {
        parsed = parseInt(value, 16);
      } else {
        parsed = parseInt(value, 10);
      }

      return parsed / LAMPORTS_PER_SOL;
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
    return data.sol;
  };

  const getPlayerAccount = async (pda: string) => {
    const res = await fetch("/api/platform/getPlayerAccount", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerPda: pda }),
    });

    const data = await res.json();

    console.log("data:", data);

    if (!res.ok) {
      throw new Error(data.error || "Failed to fetch player account");
    }

    return data.playerAccount as Player; // Contains playerPda and playerAccount
  };


  // Set up program when wallet is connected
  useEffect(() => {
    if (!publicKey) return;

    const provider = new AnchorProvider(
      connection,
      { publicKey, signTransaction, signAllTransactions } as any,
      { commitment: COMMITMENT }
    );
    const prog = new Program(idl, provider) as unknown as MoonbetsProgram;
    setProgram(prog);

    (async () => {
      const [playerPda] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("playerd"), publicKey.toBytes()],
        programID
      );
      setPlayerPda(playerPda);
    })();

    // Fetch wallet balance
    fetchWalletBalance();
    checkPlayerAccount();
  }, [connection, publicKey, connected]);

  // Fetch wallet SOL balance
  const fetchWalletBalance = async () => {
    if (!publicKey || !connection) return;
    try {
      const balance = await getBalance(publicKey.toBase58());
      setBalance(balance);
    } catch (e) {
      console.error("Failed to fetch balance:", e);
      setErrorMessage("Failed to fetch wallet balance");
    }
  };

  // Check if player account exists
  const checkPlayerAccount = async () => {
    if (!program || !playerPda) return;
    
    try {
      await getStats();
    } catch (e) {
      console.log("Player account doesn't exist, needs initialization:", e);
      await initializePlayer()
    }
  };

  // Get player stats from the program
  const getStats = async () => {
    if (!program || !playerPda) return;
    
    try {
      const account = await getPlayerAccount(playerPda.toBase58());
      // console.log("account:", account)

      setStats(account);
      // console.log("Player stats:", account);
      
      /// Generate last results based on wins and losses count
      if (account.wins !== undefined && account.losses !== undefined) {
        const wins = parseInt(account.wins.toString());
        const losses = parseInt(account.losses.toString());
        
        // Create an array with the most recent 10 results (assuming wins are more recent)
        const results: Array<"win" | "lose"> = [];
        
        // Add the most recent results first (we'll assume wins are most recent if both exist)
        const totalGames = wins + losses;
        let remainingWins = wins;
        let remainingLosses = losses;
        
        for (let i = 0; i < totalGames; i++) {
          if (remainingWins > 0 && (remainingWins >= remainingLosses || remainingLosses === 0)) {
            results.push("win");
            remainingWins--;
          } else if (remainingLosses > 0) {
            results.push("lose");
            remainingLosses--;
          }
        }
        
        setLastResults(results);
      }
      
      return account;
    } catch (e) {
      console.error("Failed to fetch stats:", e);
      throw e;
    }
  };

  // Client-side implementation for reference
  // Use this in your React component
  const initializePlayer = async () => {
      if (!publicKey || !signTransaction) {
          toast.error("Wallet not connected");
          return;
      }

      try {
          console.log("Initializing player...");
          
          const res = await fetch("/api/platform/initializePlayer", {
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

          // console.log("Deserializing and signing transaction...");
          const txBuffer = Buffer.from(data.transaction, "base64");
          const tx = web3.Transaction.from(txBuffer);

          const signed = await signTransaction(tx);
          // console.log("Transaction signed, sending to network...");
          
          const sig = await connection.sendRawTransaction(signed.serialize());
          console.log("Transaction sent with signature:", sig);
          
          // console.log("Confirming transaction...");
          await connection.confirmTransaction(sig, "confirmed");
          console.log("Transaction confirmed!");

          toast.success("Player initialized successfully");
          
          // Return the player PDA in case the caller needs it
          return data.playerPda;
      } catch (err: any) {
          console.error("Failed to initialize player:", err);
          toast.error(`Player initialization failed: ${err.message}`);
          throw err;
      }
  };

  // Place a bet
  const placeBet = async () => {
    if (!publicKey || !signTransaction || !connection || !program || !playerPda) {
      toast.error("Wallet not connected");
      return;
    }

    try {
      setIsSpinning(true);
      setShowResult(null);

      console.log("Placing bet...");
      const betAmountLamports = betAmount * LAMPORTS_PER_SOL;

      const requestBody = {
        publicKey: publicKey.toBase58(),
        betAmount: betAmountLamports,
      };

      // Get the transaction
      const res = await fetch("/api/platform/playBet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          `HTTP error! Status: ${res.status}. ${errorData.error || ""} ${errorData.details || ""}`
        );
      }

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (!data.transaction) throw new Error("No transaction returned");

      const oldPlayer = data.oldPlayer;
      console.log("Old player state:", oldPlayer);

      console.log("Deserializing and signing transaction...");
      const txBuffer = Buffer.from(data.transaction, "base64");
      const tx = web3.Transaction.from(txBuffer);

      const signed = await signTransaction(tx);
      const sig = await connection.sendRawTransaction(signed.serialize());

      console.log("Transaction sent with signature:", sig);
      setShowBetProgress(true); // SHOW animated overlay here

      await connection.confirmTransaction(sig, "confirmed");
      console.log("Transaction confirmed. Polling for result...");

      const resultData = await waitForBetResult(oldPlayer);

      if (resultData) {
        const result: "win" | "lose" = resultData.won ? "win" : "lose";
        setShowResult(result);

        if (result === "win") {
          setTimeout(() => {
            confetti({
              particleCount: 100,
              spread: 200,
              origin: { y: 0.6 },
              colors: [
                "#f44336", "#e91e63", "#9c27b0", "#673ab7", "#3f51b5",
                "#2196f3", "#03a9f4", "#00bcd4", "#009688", "#4CAF50",
                "#8BC34A", "#CDDC39", "#FFEB3B", "#FFC107", "#FF9800", "#FF5722",
              ],
            });
          }, 500);
        }
      } else {
        toast.error("Bet result timeout. Please check your balance.");
      }

      await getStats();
      await fetchWalletBalance?.();

      // Right before return or error
      setShowBetProgress(false);
      return resultData;
    } catch (err) {
      // Right before return or error
      setShowBetProgress(false);
      console.error("Failed to place bet:", err);
      toast.error(`Bet failed: ${(err as Error).message}`);
      setErrorMessage?.("Failed to place bet: " + (err as Error).message);
      throw err;
    } finally {
      setIsSpinning(false);
    }
  };


  /**
   * Wait for the result of a bet using both event listener and polling
   * @param oldPlayer Previous player state
   * @param eventPromise Promise for the DiceRolled event
   * @param listener Event listener ID
   */
  const waitForBetResult = async (
    oldPlayer: any
  ): Promise<DiceRolledEvent | null> => {
    try {
      if (!publicKey || !connection || !program || !playerPda) {
        toast.error("Wallet not connected");
        return null;
      }

      const maxWaitTime = 70000;
      const interval = 5000;
      const start = Date.now();

      while (Date.now() - start < maxWaitTime) {
        try {
          const player = await getPlayerAccount(playerPda.toBase58());
          console.log("Polling player stats...", {
            wins: player.wins,
            losses: player.losses,
            currentBet: player.currentBet,
          });

          // Check if a bet has been resolved
          const hasBetResolved = player.currentBet === 0 && (
            player.wins !== oldPlayer.wins ||
            player.losses !== oldPlayer.losses
          );

          if (hasBetResolved) {
            const won = player.wins > oldPlayer.wins;
            const result: DiceRolledEvent = {
              player: playerPda,
              result: won ? 1 : 0, // custom logic if needed
              won,
              payout: player.pendingWithdrawal,
            };

            console.log("Result found via polling:", {
              won,
              payout: result.payout.toString(),
            });

            return result;
          }
        } catch (error) {
          console.error("Error polling player account:", error);
        }

        await new Promise((res) => setTimeout(res, interval));
      }

      console.warn("Polling timed out without detecting a result.");
      return null;
    } catch (err) {
      console.error("Failed to poll result:", err);
      return null;
    }
  };

  // Withdraw winnings
  const withdrawWinnings = async () => {
    try {
      if (!publicKey || !signTransaction || !connection || !program) {
          toast.error("Wallet not connected");
          return;
      }

      const player = publicKey.toBase58()

      const res = await fetch("/api/platform/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ player: player }),
      });

      const data = await res.json();

      // console.log("withdraw data:", data)

      if (!res.ok) {
        throw new Error(data.error || "Withdraw request failed");
      }

      // 2. Decode and deserialize transaction
      // console.log("Deserializing and signing transaction...");
      const txBuffer = Buffer.from(data.transaction, "base64");
      const tx = web3.Transaction.from(txBuffer);

      const signed = await signTransaction(tx);
      const sig = await connection.sendRawTransaction(signed.serialize());

      console.log("Transaction sent with signature:", sig);
      await connection.confirmTransaction(sig, "confirmed");

      console.log("Withdraw transaction sent with signature:", sig);

      await getStats();
      await fetchWalletBalance();
    } catch (e) {
      console.error("Failed to withdraw:", e);
      setErrorMessage("Failed to withdraw: " + (e as Error).message);
    }
  };


  // Reset error message after 5 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // console.log("connected:", connected);
  // console.log("isSpinning:", isSpinning);
  // console.log("betAmount:", betAmount);
  // console.log("balance:", balance);
  // Check if betting is allowed
  const canBet = connected && !isSpinning && betAmount > 0 && betAmount <= balance;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] to-[#1a1a3a] text-white overflow-hidden relative flex flex-col">
      {/* Moon background */}
      <MoonBackground />

      <div className="container mx-auto px-4 py-6 relative z-10 h-full flex-grow">
        <Header
          setLastResults={setLastResults}
          setShowResult={setShowResult}
        />


        {/* Error message display */}
        {errorMessage && (
          <div className="w-full max-w-md mx-auto mb-4 p-3 bg-red-900/50 text-white rounded-md text-center">
            {errorMessage}
          </div>
        )}

        {/* In your top-level layout or component */}
        {showBetProgress && <BetProgressOverlay visible />}


        <div className="grid md:grid-cols-3 gap-y-8 md:gap-8">
          <Card className="lg:col-span-2 bg-black/40 border-blue-500/30 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="relative h-full">
                {/* Background decoration */}
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                  <div className="w-96 h-96 rounded-full bg-blue-300 blur-3xl"></div>
                </div>

                <div className="relative p-8 flex flex-col items-center justify-center min-h-[400px]">
                  {/* Bet amount input with fancy border */}
                  <div className="mb-8 w-full max-w-xs">
                    <label className="block text-center mb-2 text-xl font-bold text-blue-200">
                      BET AMOUNT
                    </label>
                    <div className="relative">
                      {/* Fancy input border wrapper */}
                      <div className="relative p-[2px] rounded-md overflow-hidden bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 animate-gradient-x">
                        <Input
                          type="number"
                          value={betAmount}
                          onChange={(e) =>
                            setBetAmount(Number.parseFloat(e.target.value) || 0)
                          }
                          className={cn(
                            "text-center text-2xl py-6 bg-black border-0 text-white rounded-[3px]",
                            !connected && "opacity-70"
                          )}
                          min={0.001}
                          max={connected ? balance : 0}
                          step={0.01}
                          disabled={!connected || isSpinning}
                        />
                      </div>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300">
                        <Coins className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* Result display */}
                  {showResult && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`mb-8 text-4xl font-bold ${
                        showResult === "win" ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {showResult === "win" ? "TO THE MOON!" : "CRASHED!"}
                    </motion.div>
                  )}

                  {/* Enhanced Bet button with more glaring animation */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative"
                  >
                    {/* Outer glow effect */}
                    <div
                      className="absolute inset-0 rounded-full blur-md"
                      style={{
                        transform: "scale(1.1)",
                      }}
                    />

                    <Button
                      onClick={placeBet}
                      disabled={!canBet}
                      className={`
                        w-28 h-28 rounded-full text-3xl font-bold shadow-lg transition-all duration-300 relative overflow-hidden z-10
                        ${canBet ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500' : 'bg-gray-700'}
                      `}
                    >
                      {isSpinning ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "linear",
                          }}
                        >
                          <RotateCcw className="w-10 h-10" />
                        </motion.div>
                      ) : (
                        "BET"
                      )}

                      {/* Enhanced pulsing effect */}
                      {!isSpinning && canBet && (
                        <motion.div
                          className="absolute inset-0 rounded-full bg-white"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{
                            opacity: [0, 0.3, 0],
                            scale: [0.8, 1.3, 0.8],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut",
                          }}
                        />
                      )}
                    </Button>
                  </motion.div>

                  <p className="mt-6 text-gray-400 text-center max-w-xs">
                    Press BET to launch to the moon and double your bet or
                    crash!
                  </p>

                  {!connected && (
                    <div className="mt-6 text-center">
                      <WalletMultiButton className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200 text-white py-2 px-4 rounded-md" />
                      <p className="mt-2 text-blue-300 text-sm">Connect your wallet to play</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="col-span-1">
            {/* Stats card */}
            <Stats
              walletConnected={connected}
              setBalance={setBalance}
              balance={balance}
              isSpinning={isSpinning}
              lastResults={lastResults}
              pendingWithdrawal={safeParseAmount(stats?.pendingWithdrawal)}
              onWithdraw={withdrawWinnings}
            />
          </div>
        </div>
        <Particles />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
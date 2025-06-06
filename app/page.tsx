"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { RotateCcw, Coins } from "lucide-react";
// import confetti from "canvas-confetti";
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
import SuccessModal from "@/components/ui/SuccessModal";
import {
  generateQuantumLog,
  verifyQuantumLog,
  QuantumLog,
} from "../lib/quantumFairness";
import QuantumAnimation, {
  AnimatedValues,
} from "@/components/ui/QuantumReveal";
import confetti from "canvas-confetti";
import Image from "next/image";

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
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // QUANTUM EMISSION
  const [finalLog, setFinalLog] = useState<QuantumLog | null>(null);
  const [displayed, setDisplayed] = useState<AnimatedValues | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [verified, setVerified] = useState<boolean | null>(null);
  const [particlesResolved, setParticlesResolved] = useState<boolean>(false);

  const programID = new web3.PublicKey(idl.address);
  const COMMITMENT = "confirmed";

  const safeParseAmount = (value: any): number => {
    if (!value) return 0;

    // Handle BN objects
    if (typeof value.toNumber === "function") {
      return value.toNumber() / LAMPORTS_PER_SOL;
    }

    // Handle string numbers
    if (typeof value === "string") {
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
    if (typeof value === "number") {
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

  useEffect(() => {
    if (revealed && showResult === "win") {
      confetti({
        particleCount: 100,
        spread: 200,
        origin: { y: 0.6 },
        colors: [
          "#f44336",
          "#e91e63",
          "#9c27b0",
          "#673ab7",
          "#3f51b5",
          "#2196f3",
          "#03a9f4",
          "#00bcd4",
          "#009688",
          "#4CAF50",
          "#8BC34A",
          "#CDDC39",
          "#FFEB3B",
          "#FFC107",
          "#FF9800",
          "#FF5722",
        ],
      });
    }
  }, [revealed, showResult]);

  // First useEffect - Initialize program when wallet changes
  useEffect(() => {
    if (!publicKey || !signTransaction || !signAllTransactions) {
      // Reset everything if wallet is disconnected
      setProgram(null);
      setPlayerPda(null);
      setStats(null);
      setBalance(0);
      return;
    }

    // Connect to the Solana network
    const connection_ = new web3.Connection(
      web3.clusterApiUrl("mainnet-beta"),
      COMMITMENT
    );

    // Reinitialize program with the new wallet
    const provider = new AnchorProvider(
      connection_,
      { publicKey, signTransaction, signAllTransactions } as any,
      { commitment: COMMITMENT }
    );
    const prog = new Program(idl, provider) as unknown as MoonbetsProgram;
    setProgram(prog);

    // Calculate and set player PDA
    const [playerPda] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("playerd"), publicKey.toBytes()],
      programID
    );
    setPlayerPda(playerPda);
  }, [connection, publicKey, signTransaction, signAllTransactions]);

  // Second useEffect - Fetch balance when wallet changes
  useEffect(() => {
    const fetchBalance = async () => {
      if (publicKey) {
        try {
          const balance = await getBalance(publicKey.toBase58());
          setBalance(balance);
        } catch (err) {
          console.error("Error fetching balance:", err);
        }
      }
    };

    fetchBalance();
  }, [publicKey]);

  // Third useEffect - Fetch stats when playerPda changes
  useEffect(() => {
    const fetchStats = async () => {
      if (playerPda && publicKey) {
        try {
          await getStats(); // <-- Await this async function
        } catch (err) {
          await initializePlayer();
          console.error("Error in third hook:", err);
        }
      }
    };

    fetchStats(); // Call the inner async function
  }, [playerPda, publicKey]);

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
          if (
            remainingWins > 0 &&
            (remainingWins >= remainingLosses || remainingLosses === 0)
          ) {
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
      setSuccessMessage("Hang on, getting you set!");
      setShowSuccess(true);

      const res = await fetch("/api/platform/initializePlayer", {
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

      // console.log("Deserializing and signing transaction...");
      const txBuffer = Buffer.from(data.transaction, "base64");
      const tx = web3.Transaction.from(txBuffer);

      const signed = await signTransaction(tx);
      // console.log("Transaction signed, sending to network...");

      const sig = await connection.sendRawTransaction(signed.serialize());
      // console.log("Transaction sent with signature:", sig);

      // console.log("Confirming transaction...");
      await connection.confirmTransaction(sig, "confirmed");
      // console.log("Transaction confirmed!");

      // toast.success("Player initialized successfully");
      setSuccessMessage("You're set!");
      setShowSuccess(true);

      // Return the player PDA in case the caller needs it
      return data.playerPda;
    } catch (err: any) {
      console.error("Failed to initialize player:", err);
      // toast.error(`Player initialization failed: ${err.message}`);
      throw err;
    }
  };

  const initQuantumParticles = () => {
    const log = generateQuantumLog();
    setFinalLog(log);
    setVerified(verifyQuantumLog(log));
    setRevealed(false);

    // Start from near-zero noise
    const starting: AnimatedValues = {
      quantum: Math.random() * 0.0001,
      adjustedChance: Math.random() * 0.0001,
      entropy: Math.random() * 0.0001,
      confidence: Math.random() * 0.0001,
      variation: 0,
    };

    return { starting, log };
  };

  // Place a bet
  const placeBet = async () => {
    if (
      !publicKey ||
      !signTransaction ||
      !connection ||
      !program ||
      !playerPda
    ) {
      toast.error("Wallet not connected");
      return;
    }

    const result = initQuantumParticles();
    const starting = result.starting;
    const log = result.log;
    // resolve sine particles
    const particlesResolution = finalLog && finalLog?.success ? 1 : 0;
    setParticlesResolved(particlesResolution === 1 ? true : false);
    console.log("particlesResolved:", particlesResolved);

    try {
      setIsSpinning(true);
      setShowResult(null);

      // console.log("Placing bet...");
      const betAmountLamports = betAmount * LAMPORTS_PER_SOL;

      const requestBody = {
        publicKey: publicKey.toBase58(),
        betAmount: betAmountLamports,
        particlesResolved: particlesResolved,
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
          `HTTP error! Status: ${res.status}. ${errorData.error || ""} ${
            errorData.details || ""
          }`
        );
      }

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (!data.transaction) throw new Error("No transaction returned");

      console.log("Deserializing and signing transaction...");
      const txBuffer = Buffer.from(data.transaction, "base64");
      const tx = web3.Transaction.from(txBuffer);

      const signed = await signTransaction(tx);
      const sig = await connection.sendRawTransaction(signed.serialize());

      console.log("Transaction sent with signature:", sig);

      await connection.confirmTransaction(sig, "confirmed");
      console.log("Transaction confirmed. Polling for result...");

      setDisplayed(starting);
      // animateTowardTarget(log, startingFake, 5000);

      // After 5 seconds, reveal the result
      setTimeout(() => {
        setDisplayed({
          quantum: log.quantum,
          adjustedChance: log.adjustedChance,
          entropy: log.entropy,
          confidence: log.confidence,
          variation: log.variation,
        });
        setRevealed(true);
      }, 5000);

      if (finalLog) {
        console.log("Final log:", finalLog);
        console.log("particlesResolution:", particlesResolution);
        const result: "win" | "lose" =
          particlesResolution === 1 ? "win" : "lose";
        console.log("Bet result:", result);
        setShowResult(result);

        // if (result === "win") {
        //   setTimeout(() => {
        //     confetti({
        //       particleCount: 100,
        //       spread: 200,
        //       origin: { y: 0.6 },
        //       colors: [
        //         "#f44336",
        //         "#e91e63",
        //         "#9c27b0",
        //         "#673ab7",
        //         "#3f51b5",
        //         "#2196f3",
        //         "#03a9f4",
        //         "#00bcd4",
        //         "#009688",
        //         "#4CAF50",
        //         "#8BC34A",
        //         "#CDDC39",
        //         "#FFEB3B",
        //         "#FFC107",
        //         "#FF9800",
        //         "#FF5722",
        //       ],
        //     });
        //   }, 500);
        // }
      } else {
        toast.error("Bet result timeout. Please check your balance.");
      }

      await getStats();
      await fetchWalletBalance?.();

      return;
    } catch (err) {
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

      const maxWaitTime = 60000;
      const interval = 5000;
      const start = Date.now();

      while (Date.now() - start < maxWaitTime) {
        try {
          // const player = await getPlayerAccount(playerPda.toBase58());
          const player = await program.account.player.fetch(playerPda);
          console.log("Polling player stats...", {
            wins: player.wins,
            losses: player.losses,
            currentBet: player.currentBet,
          });

          const hasBetResolved =
            player.currentBet === 0 &&
            (player.wins !== oldPlayer.wins ||
              player.losses !== oldPlayer.losses);

          if (hasBetResolved) {
            console.log("Has resolved");
            const won = player.wins > oldPlayer.wins;
            const result: DiceRolledEvent = {
              player: playerPda,
              result: won ? 1 : 0,
              won,
              payout: player.pendingWithdrawal,
            };

            console.log("Result found via polling:", {
              won,
              payout: result.payout.toString(),
            });

            setBetAmount(0.01); // Reset bet amount on error

            return result;
          }
        } catch (error) {
          console.error("Error polling player account:", error);
          // Continue to next polling interval
        }

        await new Promise((res) => setTimeout(res, interval));
      }

      // console.warn("Polling timed out without detecting a result.");
      setBetAmount(0.01); // Reset bet amount on error
      // Return loss result if timeout happens
      return {
        player: playerPda,
        result: 0,
        won: false,
        payout: BN(0),
      };
    } catch (err) {
      console.error("Failed to poll result:", err);
      setBetAmount(0.01); // Reset bet amount on error
      if (playerPda) {
        return {
          player: playerPda,
          result: 0,
          won: false,
          payout: BN(0),
        };
      } else {
        setBetAmount(0.01); // Reset bet amount on error
        return null;
      }
    }
  };

  // Withdraw winnings
  const withdrawWinnings = async () => {
    try {
      if (!publicKey || !signTransaction || !connection || !program) {
        toast.error("Wallet not connected");
        return;
      }

      const player = publicKey.toBase58();

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
  const canBet =
    connected && !isSpinning && betAmount > 0 && betAmount <= balance;

  return (
    <div>
      <div className="container mx-auto relative z-10 h-full flex-grow">
        {/* <Header setLastResults={setLastResults} setShowResult={setShowResult} /> */}

        {/* Error message display */}
        {errorMessage && (
          <div className="w-full max-w-md mx-auto mb-4 p-3 bg-red-900/50 text-white rounded-md text-center">
            {errorMessage}
          </div>
        )}

        {displayed && (
          <QuantumAnimation
            visible={true}
            animatedValues={displayed}
            revealed={revealed}
            finalLog={finalLog || undefined}
            verified={verified || false}
            onClose={() => setDisplayed(null)} // This will unmount the component
            particlesResolved={particlesResolved}
          />
        )}

        <SuccessModal
          visible={showSuccess}
          message={successMessage}
          onClose={() => setShowSuccess(false)}
        />

        <div className="grid md:grid-cols-3 relative w-full">
          <Card className=" relative bg-[url('/bg2.jpg')] bg-center lg:col-span-2 border-blue-500/30 overflow-hidden bg-transparent rounded-none">
            <div className="absolute bg-[#00046b]/50 top-0 left-0 w-full h-full"></div>
            <CardContent className="p-0 rounded-none">
              <div className="relative h-full pt-3 px-5 md:px-0 md:pl-5">
                {/* Background decoration */}
                <div className="flex items-center justify-between">
                  <Image width={100} height={100} src="/logo.webp" alt="LOGO" />
                  <div className="sm:hidden">
                    <WalletMultiButton className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200 text-white py-2 px-4 rounded-md" />
                  </div>
                </div>
                <div className="relative px-8 flex flex-col items-center justify-center min-h-[400px]">
                  {/* Bet amount input with fancy border */}
                  <div className="mb-7 w-full max-w-xs">
                    <label className="block text-center mb-2 text-xl font-bold text-blue-200">
                      <Image
                        src="/bet-amount.webp"
                        width={250}
                        height={42}
                        alt="Bet Amount"
                        className="block mx-auto"
                      />
                    </label>
                    <div className="relative">
                      {/* Fancy input border wrapper */}
                      <div className="relative p-[1px] rounded-md overflow-hidden bg-purple-500">
                        {/* <div className="relative p-[1px] rounded-md overflow-hidden bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"> */}
                        <Input
                          type="number"
                          value={betAmount}
                          onChange={(e) =>
                            setBetAmount(Number.parseFloat(e.target.value) || 0)
                          }
                          className="text-center text-[#FF5C5C] bg-[#00046b] text-2xl py-6 border-0 rounded-md z-1"
                          min={0.001}
                          max={connected ? balance : 0}
                          step={0.01}
                          disabled={!connected || isSpinning}
                        />
                      </div>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300">
                        <Image
                          src="/coin.webp"
                          width={32}
                          height={32}
                          alt="coin icon"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Result display */}
                  {/* {showResult && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`mb-8 text-4xl font-bold ${
                        showResult === "win" ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {showResult === "win" ? "TO THE MOON!" : "CRASHED!"}
                    </motion.div>
                  )} */}

                  <p className="text-lg text-[#87d7fa] text-center max-w-xs">
                    Press BET to launch to the moon and double your bet or
                    crash!
                  </p>

                  <button
                    onClick={placeBet}
                    disabled={!canBet}
                    className="relative"
                  >
                    <Image
                      width={200}
                      height={200}
                      src="/button.webp"
                      alt="Bet button"
                    />
                    {/* {isSpinning ? (
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
											)} */}
                    {/* Enhanced pulsing effect */}
                    {/* {!isSpinning && canBet && (
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
											)} */}
                  </button>

                  {!connected && (
                    <div className="mt-4 text-center">
                      <WalletMultiButton className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200 text-white py-2 px-4 rounded-md" />
                      <p className="mt-2 text-[#87d7fa] text-sm">
                        Connect your wallet to play
                      </p>
                    </div>
                  )}
                  <p className="text-[#95b6de] text-center mt-5 pb-2 text-sm">
                    #MOONBETS NATIVE TOKEN CA:
                    <br />
                    <span className="text-wrap">
                      AqV6x8nSXujXXo7GY1uaZTQgaVNXEQkhSHK4yubKitQK
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col col-span-1 bg-[url('/bg.jpg')] bg-center bg-contain">
            {/* Stats card */}

            <div className="">
              <div className="hidden md:flex pt-8 pr-8 justify-end">
                <WalletMultiButton className="hidden sm:block bg-blue-600 hover:bg-blue-700 transition-colors duration-200 text-white py-2 px-4 rounded-md" />
              </div>
              <div className="w-full max-w-[300px] mx-auto">
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
            <Footer />
          </div>
        </div>

        {/* <Particles /> */}
      </div>
    </div>
  );
}

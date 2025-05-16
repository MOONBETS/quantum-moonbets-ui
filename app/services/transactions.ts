// services/transaction.ts
import { MoonbetsProgram } from "../types/program";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { BN, web3 } from "@coral-xyz/anchor";
import { DiceRolledEvent } from "../types/events";

export class TransactionService {
  private program: MoonbetsProgram;
  private playerPda: PublicKey;
  private publicKey: PublicKey;
  private platformVault: PublicKey;
  private platformStats: PublicKey;
  private vrfProgramAddress: PublicKey;

  constructor(
    program: MoonbetsProgram,
    playerPda: PublicKey,
    publicKey: PublicKey,
    platformVault: PublicKey,
    platformStats: PublicKey,
    vrfProgramAddress: PublicKey
  ) {
    this.program = program;
    this.playerPda = playerPda;
    this.publicKey = publicKey;
    this.platformVault = platformVault;
    this.platformStats = platformStats;
    this.vrfProgramAddress = vrfProgramAddress;
  }

  async placeBet(betAmount: BN): Promise<void> {
    try {
      if (isNaN(betAmount) || betAmount <= 0) {
        throw new Error("Invalid bet amount");
      }

      const clientSeed = new BN(42);

      // generate random number between 1-6
      const betNumber = Math.floor(Math.random() * 6) + 1;

      const [programIdentity] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("identity")],
        this.program.programId
      );

      const oracleQueueAddress = new PublicKey("Cuj97ggrhhidhbu39TijNVqE74xvKJ69gDervRUXAxGh");

      // Add event listener
      let listener: number | null = null;
      const eventPromise = new Promise<DiceRolledEvent>((resolve) => {
        listener = this.program.addEventListener("DiceRolled", (event: DiceRolledEvent) => {
          if (event.player.equals(this.playerPda)) {
            console.log("DiceRolled event:", {
              player: event.player.toBase58(),
              result: event.result,
              won: event.won,
              payout: event.payout.toString()
            });
            resolve(event);
          }
        });
      });

      console.log("Placing bet...");

      // Place bet
      await this.program.methods
        .play(betNumber, betAmount, clientSeed)
        .accounts({
          payer: this.publicKey,
          player: this.playerPda,
          platformVault: this.platformVault,
          platformStats: this.platformStats,
          oracleQueue: oracleQueueAddress,
          programIdentity: programIdentity,
          slotHashes: web3.SYSVAR_SLOT_HASHES_PUBKEY,
          vrfProgram: this.vrfProgramAddress,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("Bet placed successfully");

      const oldPlayer = await this.program.account.player.fetch(this.playerPda);

      await this.waitForResult(oldPlayer, eventPromise, listener);

    } catch (e) {
      console.error("Bet failed:", e);
      throw new Error("Bet failed: " + (e as Error).message);
    }
  }

  private async waitForResult(
    oldPlayer: any,
    eventPromise: Promise<DiceRolledEvent>,
    listener: number | null
  ): Promise<void> {
    try {
      const pollPromise = new Promise<void>(async (resolve) => {
        const maxWaitTime = 60000;
        const start = Date.now();
        while (Date.now() - start < maxWaitTime) {
          const player = await this.program.account.player.fetch(this.playerPda);
          console.log("Checking player stats...", player);
          if (player.lastResult !== oldPlayer.lastResult && player.currentBet === 0) {
            console.log("Result found via polling:", player.lastResult);
            resolve();
            return;
          }
          await new Promise(res => setTimeout(res, 3000)); // Poll faster for better UX
        }
      });

      const result = await Promise.race([
        eventPromise.then((event) => {
          console.log("Event received:", event);
          if (event.won) {
            console.log("You won!");
          } else {
            console.log("You lost.");
          }
        }),
        pollPromise
      ]);

    } catch (err) {
      console.error("Failed to get result:", err);
    } finally {
      if (listener) {
        await this.program.removeEventListener(listener);
      }
    }
  }


  async withdraw(): Promise<void> {
    try {
      await this.program.methods
        .withdraw()
        .accounts({
          payer: this.publicKey,
          player: this.playerPda,
          platformVault: this.platformVault,
        })
        .rpc();
      console.log("Withdrawal successful");
    } catch (e) {
      console.error("Withdrawal failed:", e);
    }
  }
}
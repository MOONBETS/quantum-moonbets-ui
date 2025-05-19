// services/transaction.ts
import { MoonbetsProgram } from "../types/program";
import { Connection, Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { BN, web3 } from "@coral-xyz/anchor";
import { DiceRolledEvent } from "../types/events";
import { PlatformStats, Player, Admin } from "../types/accounts";

export class TransactionService {
  private program: MoonbetsProgram;
  private playerPda: PublicKey;
  private publicKey: PublicKey;
  private platformVault: PublicKey;
  private platformStats: PublicKey;
  private statsBump: number;
  private vrfProgramAddress: PublicKey;
  private vaultBump: number;
  private programIdentityPubkey: PublicKey;
  private identityBump: number;
  private oracleQueue: PublicKey;
  private connection: Connection;
  private wallet: any;

  constructor(
    program: MoonbetsProgram,
    playerPda: PublicKey,
    publicKey: PublicKey,
  ) {
    this.program = program;
    this.playerPda = playerPda;
    this.publicKey = publicKey;
    this.connection = program.provider.connection;
    this.wallet = program.provider.wallet;

    // Find vault bump
    const [vaultPda, vaultBump] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("platform_vault")],
      this.program.programId
    );
    this.vaultBump = vaultBump;
    this.platformVault = vaultPda;

    // Find stats bump
    const [platformStats, statsBump] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("platform_stats")],
      this.program.programId
    );
    this.statsBump = statsBump;
    this.platformStats = platformStats;

    // Find VRF program identity
    const [programIdentityPubkey, identityBump] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("identity")],
      this.program.programId
    );
    this.programIdentityPubkey = programIdentityPubkey;
    this.identityBump = identityBump;

    // Setup VRF oracle queue
    this.oracleQueue = new PublicKey("Cuj97ggrhhidhbu39TijNVqE74xvKJ69gDervRUXAxGh");
    this.vrfProgramAddress = new PublicKey("Vrf1RNUjXmQGjmQrQLvJHs9SNkvDJEsRVFPkfSQUwGz");
  }

  /**
   * Initialize a new player account
   */
  async initializePlayer(): Promise<void> {
    try {
      await this.program.methods
        .initializePlayer()
        .accountsStrict({
          payer: this.publicKey,
          player: this.playerPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("Player initialized successfully");

      // Wait for confirmation
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Fetch and log player account
      const player = await this.program.account.player.fetch(this.playerPda);
      console.log("Player account:", {
        lastResult: player.lastResult,
        currentBet: player.currentBet,
        lastBetAmount: player.lastBetAmount.toString(),
        pendingWithdrawal: player.pendingWithdrawal.toString(),
        wins: player.wins,
        losses: player.losses,
        totalGames: player.totalGames
      });
    } catch (e) {
      console.error("Player initialization failed:", e);
      throw new Error("Player initialization failed: " + (e as Error).message);
    }
  }

  /**
   * Initialize the platform with stats and vault
   * @param platformStatsKeypair Optional keypair for platform stats account
   */
  async initializePlatform(platformStatsKeypair?: Keypair): Promise<void> {
    try {
      // Get admin PDA
      const [adminPda] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("admin"), this.publicKey.toBuffer()],
        this.program.programId
      );

      // Use provided keypair or generate one
      const statsKeypair = platformStatsKeypair || web3.Keypair.generate();
      console.log("Platform stats:", statsKeypair.publicKey.toBase58());

      await this.program.methods
        .initializePlatform()
        .accountsStrict({
          admin: this.publicKey,
          platformStats: statsKeypair.publicKey,
          platformVault: this.platformVault,
          adminAccount: adminPda,
          systemProgram: SystemProgram.programId,
        })
        .signers([statsKeypair])
        .rpc();

      console.log("Platform initialized successfully");

      // Wait for confirmation
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Fetch and verify platform stats
      const platformStats = await this.program.account.platformStats.fetch(statsKeypair.publicKey);
      console.log("Platform stats:", {
        isInitialized: platformStats.isInitialized,
        withdrawnToday: platformStats.withdrawnToday.toString(),
        primaryAdmin: platformStats.primaryAdmin.toString(),
        adminCount: platformStats.adminCount
      });

      // Update platformStats in case it was generated
      this.platformStats = statsKeypair.publicKey;
    } catch (e) {
      console.error("Platform initialization failed:", e);
      throw new Error("Platform initialization failed: " + (e as Error).message);
    }
  }

  /**
   * Add a new admin to the platform
   * @param newAdminPublicKey The public key of the new admin to add
   */
  // async addAdmin(newAdminPublicKey: PublicKey): Promise<void> {
  //   try {
  //     // Get admin PDA for the new admin
  //     const [adminPda] = web3.PublicKey.findProgramAddressSync(
  //       [Buffer.from("admin"), newAdminPublicKey.toBuffer()],
  //       this.program.programId
  //     );

  //     console.log("Adding admin:", newAdminPublicKey.toBase58());
  //     console.log("Admin PDA:", adminPda.toBase58());

  //     await this.program.methods
  //       .addAdmin()
  //       .accountsStrict({
  //         primaryAdmin: this.publicKey,
  //         platformStats: this.platformStats,
  //         admin: adminPda,
  //         newAdmin: newAdminPublicKey,
  //         systemProgram: SystemProgram.programId,
  //       })
  //       .rpc({ commitment: "confirmed" });

  //     console.log("Admin added successfully");

  //     // Wait for confirmation
  //     await new Promise(resolve => setTimeout(resolve, 2000));

  //     // Fetch and verify admin account
  //     const admin = await this.program.account.admin.fetch(adminPda);
  //     console.log("Admin account:", {
  //       pubkey: admin.pubkey.toString(),
  //       isActive: admin.isActive
  //     });

  //     // Verify admin count increased
  //     const platformStats = await this.program.account.platformStats.fetch(this.platformStats);
  //     console.log("Platform admin count:", platformStats.adminCount);
  //   } catch (e) {
  //     console.error("Adding admin failed:", e);
  //     throw new Error("Adding admin failed: " + (e as Error).message);
  //   }
  // }

  async addAdmin(newAdminPublicKey: PublicKey): Promise<void> {
    try {
      const [adminPda] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("admin"), newAdminPublicKey.toBuffer()],
        this.program.programId
      );

      console.log("Adding admin:", newAdminPublicKey.toBase58());
      console.log("Admin PDA:", adminPda.toBase58());

      // Step 1: Get a fresh blockhash
      const { blockhash } = await this.connection.getLatestBlockhash();

      // Step 2: Build transaction manually
      const tx = await this.program.methods
        .addAdmin()
        .accountsStrict({
          primaryAdmin: this.publicKey,
          platformStats: this.platformStats,
          admin: adminPda,
          newAdmin: newAdminPublicKey,
          systemProgram: SystemProgram.programId,
        })
        .transaction();

      tx.recentBlockhash = blockhash;
      tx.feePayer = this.publicKey;

      // Step 3: Sign and send
      const signedTx = await this.wallet?.signTransaction(tx); // or use your wallet adapter
      const txid = await this.connection.sendRawTransaction(signedTx.serialize());

      // Optional: Wait for confirmation
      // await this.connection.confirmTransaction(txid, "confirmed");
      console.log("Admin added successfully:", txid);

      // Wait for confirmation delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Fetch and verify admin account
      const admin = await this.program.account.admin.fetch(adminPda);
      console.log("Admin account:", {
        pubkey: admin.pubkey.toString(),
        isActive: admin.isActive
      });

      const platformStats = await this.program.account.platformStats.fetch(this.platformStats);
      console.log("Platform admin count:", platformStats.adminCount);

    } catch (e) {
      console.error("Adding admin failed:", e);
      throw new Error("Adding admin failed: " + (e as Error).message);
    }
  }


  /**
   * Remove an admin from the platform
   * @param adminPublicKey The public key of the admin to remove
   */
  async removeAdmin(adminPublicKey: PublicKey): Promise<void> {
    try {
      // Get admin PDA
      const [adminPda] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("admin"), adminPublicKey.toBuffer()],
        this.program.programId
      );

      await this.program.methods
        .removeAdmin()
        .accountsStrict({
          primaryAdmin: this.publicKey,
          platformStats: this.platformStats,
          admin: adminPda,
        })
        .rpc({ commitment: "confirmed" });

      console.log("Admin removed successfully");

      // Wait for confirmation
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Verify admin was deactivated
      const admin = await this.program.account.admin.fetch(adminPda);
      console.log("Admin account:", {
        pubkey: admin.pubkey.toString(),
        isActive: admin.isActive
      });

      // Verify admin count decreased
      const platformStats = await this.program.account.platformStats.fetch(this.platformStats);
      console.log("Platform admin count:", platformStats.adminCount);
    } catch (e) {
      console.error("Removing admin failed:", e);
      throw new Error("Removing admin failed: " + (e as Error).message);
    }
  }

  /**
   * Admin deposits funds to the platform vault
   * @param amount Amount in lamports to deposit
   */
  async adminDeposit(amount: BN): Promise<void> {
    try {
      console.log(`Depositing ${amount.toString()} lamports to platform vault...`);

      const balanceBefore = await this.program.provider.connection.getBalance(this.platformVault);
      console.log("Platform balance before:", balanceBefore / web3.LAMPORTS_PER_SOL);

      await this.program.methods
        .adminDeposit(amount)
        .accountsStrict({
          admin: this.publicKey,
          platformVault: this.platformVault,
          systemProgram: SystemProgram.programId,
        })
        .rpc({ commitment: "confirmed" });

      console.log("Admin deposit successful");

      // Wait for confirmation
      await new Promise(resolve => setTimeout(resolve, 2000));

      const balanceAfter = await this.program.provider.connection.getBalance(this.platformVault);
      console.log("Platform balance after:", balanceAfter / web3.LAMPORTS_PER_SOL);
      console.log("Difference:", (balanceAfter - balanceBefore) / web3.LAMPORTS_PER_SOL);
    } catch (e) {
      console.error("Admin deposit failed:", e);
      throw new Error("Admin deposit failed: " + (e as Error).message);
    }
  }

  /**
   * Admin withdraws funds from the platform vault
   * @param amount Amount in lamports to withdraw
   */
  async adminWithdraw(amount: BN): Promise<void> {
    try {
      console.log(`Withdrawing ${amount.toString()} lamports from platform vault...`);

      // Get admin PDA
      const [adminPda] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("admin"), this.publicKey.toBuffer()],
        this.program.programId
      );

      const adminBalanceBefore = await this.program.provider.connection.getBalance(this.publicKey);
      console.log("Admin balance before:", adminBalanceBefore / web3.LAMPORTS_PER_SOL);

      await this.program.methods
        .adminWithdraw(amount)
        .accountsStrict({
          admin: this.publicKey,
          platformVault: this.platformVault,
          platformStats: this.platformStats,
          adminAccount: adminPda, // Required for non-primary admin
          systemProgram: SystemProgram.programId,
        })
        .rpc({ commitment: "confirmed" });

      console.log("Admin withdrawal successful");

      // Wait for confirmation
      await new Promise(resolve => setTimeout(resolve, 1000));

      const adminBalanceAfter = await this.program.provider.connection.getBalance(this.publicKey);
      console.log("Admin balance after:", adminBalanceAfter / web3.LAMPORTS_PER_SOL);
      console.log("Difference:", (adminBalanceAfter - adminBalanceBefore) / web3.LAMPORTS_PER_SOL);
    } catch (e) {
      console.error("Admin withdrawal failed:", e);
      throw new Error("Admin withdrawal failed: " + (e as Error).message);
    }
  }

  /**
   * Player places a bet
   * @param betAmount Amount in lamports to bet
   * @param betChoice Optional bet choice (1-6), defaults to random
   * @param clientSeed Optional client seed for randomness, defaults to 42
   */
  async placeBet(betAmount: BN, betChoice?: number, clientSeed?: number): Promise<DiceRolledEvent> {
    if (!betAmount || betAmount.ltn(0)) {
      throw new Error("Invalid bet amount");
    }

    // Use provided values or defaults
    const seed = clientSeed ? new BN(clientSeed) : new BN(42);
    const choice = betChoice || Math.floor(Math.random() * 6) + 1;

    console.log(`Placing bet of ${betAmount.toString()} lamports on ${choice}...`);

    // Get player account before bet
    const playerBefore = await this.program.account.player.fetch(this.playerPda);
    console.log("Player before bet:", {
      lastResult: playerBefore.lastResult,
      currentBet: playerBefore.currentBet,
      totalGames: playerBefore.totalGames
    });

    // Setup event listener
    let listener: number | null = null;
    const eventPromise = new Promise<DiceRolledEvent>((resolve, reject) => {
      listener = this.program.addEventListener("diceRolled", (event: DiceRolledEvent) => {
        if (event.player.equals(this.playerPda)) {
          console.log("DiceRolled event detected:", {
            player: event.player.toBase58(),
            result: event.result,
            won: event.won,
            payout: event.payout.toString()
          });
          resolve(event);

          // Remove the listener
          if (listener !== null) {
            this.program.removeEventListener(listener);
            listener = null;
          }
        }
      });

      // Optional: add a timeout to prevent hanging
      setTimeout(() => {
        if (listener !== null) {
          this.program.removeEventListener(listener);
          listener = null;
        }
        reject(new Error("Timed out waiting for DiceRolled event"));
      }, 30000); // 30 seconds
    });

    try {
      // Send transaction
      await this.program.methods
        .play(choice, betAmount, seed)
        .accountsStrict({
          payer: this.publicKey,
          player: this.playerPda,
          platformVault: this.platformVault,
          oracleQueue: this.oracleQueue,
          programIdentity: this.programIdentityPubkey,
          slotHashes: web3.SYSVAR_SLOT_HASHES_PUBKEY,
          vrfProgram: this.vrfProgramAddress,
          systemProgram: SystemProgram.programId,
        })
        .rpc({ commitment: "confirmed" });

      console.log("Bet placed successfully");

      // Wait for the event
      const eventResult = await eventPromise;
      return eventResult;
    } catch (e) {
      console.error("Bet failed:", e);
      throw new Error("Bet failed: " + (e as Error).message);
    }
  }


  /**
   * Wait for the result of a bet
   * @param oldPlayer Previous player state
   * @param eventPromise Promise for the DiceRolled event
   * @param listener Event listener ID
   */
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
          console.log("Checking player stats...", {
            lastResult: player.lastResult,
            currentBet: player.currentBet
          });

          if (player.lastResult !== oldPlayer.lastResult && player.currentBet === 0) {
            console.log("Result found via polling:", player.lastResult);
            resolve();
            return;
          }
          await new Promise(res => setTimeout(res, 3000)); // Poll every 3 seconds
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

  /**
   * Player withdraws pending winnings
   */
  async withdraw(): Promise<void> {
    try {
      const playerBefore = await this.program.account.player.fetch(this.playerPda);
      console.log("Pending withdrawal:", playerBefore.pendingWithdrawal.toString());

      const balanceBefore = await this.program.provider.connection.getBalance(this.publicKey);
      console.log("Balance before:", balanceBefore / web3.LAMPORTS_PER_SOL);

      await this.program.methods
        .withdraw()
        .accountsStrict({
          payer: this.publicKey,
          player: this.playerPda,
          platformVault: this.platformVault,
          platformStats: this.platformStats,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("Withdrawal successful");

      // Wait for confirmation
      await new Promise(resolve => setTimeout(resolve, 1000));

      const balanceAfter = await this.program.provider.connection.getBalance(this.publicKey);
      console.log("Balance after:", balanceAfter / web3.LAMPORTS_PER_SOL);
      console.log("Difference:", (balanceAfter - balanceBefore) / web3.LAMPORTS_PER_SOL);

      const playerAfter = await this.program.account.player.fetch(this.playerPda);
      console.log("Pending withdrawal after:", playerAfter.pendingWithdrawal.toString());
    } catch (e) {
      console.error("Withdrawal failed:", e);
      throw new Error("Withdrawal failed: " + (e as Error).message);
    }
  }

  /**
   * Fetch all platform stats accounts
   */
  async loadPlatformStats(): Promise<PlatformStats[]> {
    const accounts = await this.program.account.platformStats.all();
    return accounts.map((a) => a.account);
  }

  /**
   * Get the current platform vault balance
   */
  async getPlatformBalance(): Promise<number> {
    const lamports = await this.program.provider.connection.getBalance(this.platformVault);
    return lamports / web3.LAMPORTS_PER_SOL;
  }

  /**
   * Get the player account data
   */
  async getPlayerAccount(): Promise<Player> {
    return await this.program.account.player.fetch(this.playerPda);
  }

  /**
   * Get admin account data
   * @param adminPublicKey The public key of the admin to fetch
   */
  async getAdminAccount(adminPublicKey: PublicKey): Promise<Admin> {
    const [adminPda] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("admin"), adminPublicKey.toBuffer()],
      this.program.programId
    );
    return await this.program.account.admin.fetch(adminPda);
  }

  /**
   * Utility method to sleep for a specified time
   * @param ms Time to sleep in milliseconds
   */
  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

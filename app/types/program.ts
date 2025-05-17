// types/program.ts
import { Program, Idl, BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { Moonbets } from "./moonbets";
import { Player, PlatformStats } from "./accounts";
import { DiceRolledEvent } from "./events";


export type MoonbetsProgram = Program<Moonbets>;

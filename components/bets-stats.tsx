import React, { Dispatch, SetStateAction } from "react";
import { Rocket, Moon, History } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import Image from "next/image";

type StatsProps = {
  lastResults: ("win" | "lose")[];
  walletConnected: boolean;
  isSpinning: boolean;
  balance: number;
  setBalance: Dispatch<SetStateAction<number>>;
  pendingWithdrawal: number; // <== NEW
  onWithdraw: () => void; // <== NEW
};

export default function Stats({
  lastResults,
  walletConnected,
  isSpinning,
  balance,
  setBalance,
  pendingWithdrawal,
  onWithdraw,
}: StatsProps) {
  return (
    <div className="space-y-6 mt-6">
      {/* <Card className="bg-transparent border-none"> */}
      <div className="bg-contain bg-center border-none bg-no-repeat">
        <h2 className="text-xl font-bold mb-4 gap-2 flex items-center text-[#7db0ef]">
          {/* <Rocket className="w-5 h-5 mr-2" /> */}
          <Image src="/rocket.webp" width={35} height={35} alt="icon" />
          Game Stats
        </h2>

        <div className="grid grid-cols-2 gap-4 ">
          <div className="col-span-1 p-2 bg-[#09004f] rounded-sm bg-cover bg-center bg-no-repeat">
            <div className="text-sm text-gray-400">Moon/Crash</div>
            <div className="text-xl font-bold">
              <span className="text-green-400">
                {lastResults.filter((r) => r === "win").length} 
              </span>
              /
              <span className="text-red-400">
                 {lastResults.filter((r) => r === "lose").length}
              </span>
            </div>
          </div>

          <div className="col-span-1 p-2 bg-[#09004f] bg-cover bg-center bg-no-repeat rounded-sm">
            <div className="text-sm text-gray-400">Total Bets</div>
            <div className="text-xl font-bold text-blue-300">
              {lastResults.length}
            </div>
          </div>
        </div>
      </div>
      {/* </Card> */}

      {/* History card */}
      {/* <C className="bg-[url('/history.webp')] bg-cover bg-center border-none"> */}
      <div className="w-full bg-[url(/history.webp)] bg-center bg-cover bg-no-repeat h-[150px] pl-6 pt-6">
        <h2 className="text-xl gap-2 font-bold mb-4 flex items-center text-[#7db0ef]">
          <Image src="/time.webp" width={35} height={35} alt="icon" />
          Game History
        </h2>

        <div className="flex flex-wrap gap-2">
          {lastResults.length > 0 ? (
            lastResults.map((result, index) => (
              <div key={index} className="relative">
                {result === "win" ? (
                  <Moon className="w-6 h-6 text-blue-200 fill-blue-200" />
                ) : (
                  <Moon className="w-6 h-6 text-red-400" />
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500">No launches yet</p>
          )}
        </div>
      </div>
      {/* </C> */}

      {/* Actions card */}
      {/* <Card className="bg-black/40 border-blue-500/30 backdrop-blur-sm">
				<CardContent className="p-6 space-y-3"> */}
      <div className="px-3">
        <button
          // variant="outline"
          className="w-full text-center text-base font-semibold relative text-[#ebd886] bg-[url('/withdraw-bg.webp')] h-[70px] bg-cover bg-center"
          onClick={onWithdraw}
          // disabled={!walletConnected || pendingWithdrawal <= 0 || isSpinning}
        >
          {/* <div> */}
          {/* <Image src="/withdraw-bg.webp" width={200} height={40} alt="Button" /> */}
          {/* </div> */}
          {/* <div className="bg-[url(/withdraw-bg.webp)] w-full h-full"> */}
          <p className="pb-2.5">Withdraw {pendingWithdrawal.toFixed(4)} SOL</p>
          {/* </div> */}
        </button>
      </div>
      {/* </CardContent>
			</Card> */}
    </div>
  );
}

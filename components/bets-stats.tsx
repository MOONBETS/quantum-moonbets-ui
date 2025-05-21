import React, { Dispatch, SetStateAction } from "react";
import { Rocket, Moon, History } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";

type StatsProps = {
  lastResults: ("win" | "lose")[];
  walletConnected: boolean;
  isSpinning: boolean;
  balance: number;
  setBalance: Dispatch<SetStateAction<number>>;
  pendingWithdrawal: number; // <== NEW
  onWithdraw: () => void;    // <== NEW
};


export default function Stats({
  lastResults,
  walletConnected,
  isSpinning,
  balance,
  setBalance,
  pendingWithdrawal,
  onWithdraw
}: StatsProps) {
  return (
    <div className="space-y-6 ">
      <Card className="bg-black/40 border-blue-500/30 backdrop-blur-sm">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center text-blue-300">
            <Rocket className="w-5 h-5 mr-2" />
            Game Stats
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/30 p-3 rounded-lg">
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

            <div className="bg-black/30 p-3 rounded-lg">
              <div className="text-sm text-gray-400">Total Bets</div>
              <div className="text-xl font-bold text-blue-300">
                {lastResults.length}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History card */}
      <Card className="bg-black/40 border-blue-500/30 backdrop-blur-sm">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center text-blue-300">
            <History className="w-5 h-5 mr-2" />
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
        </CardContent>
      </Card>

      {/* Actions card */}
      <Card className="bg-black/40 border-blue-500/30 backdrop-blur-sm">
        <CardContent className="p-6 space-y-3">
          <Button
            variant="outline"
            className="w-full border-green-400 text-green-300 hover:bg-green-600/20"
            onClick={onWithdraw}
            disabled={!walletConnected || pendingWithdrawal <= 0 || isSpinning}
          >
            Withdraw {pendingWithdrawal.toFixed(4)} SOL
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

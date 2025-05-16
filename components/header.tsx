import Image from "next/image";
import { Dispatch, SetStateAction } from "react";
import { Twitter, Send } from "lucide-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

interface HeaderProps {
  setLastResults: Dispatch<SetStateAction<("win" | "lose")[]>>;
  setShowResult: Dispatch<SetStateAction<"win" | "lose" | null>>;
}

export default function Header({
  setLastResults,
  setShowResult,
}: HeaderProps) {
  return (
    <header className="flex justify-between items-center mb-8 sticky top-0">
      <div className="flex items-center gap-2">
        <Image src="/logo.png" width={50} height={50} alt="Logo" />
        <h1 className="hidden md:block text-xl font-bold bg-gradient-to-r from-gray-100 via-blue-100 to-gray-200 bg-clip-text text-transparent">
          MOONBETS
        </h1>
      </div>

      <div className="flex gap-5 items-center">
        <div className="flex items-center gap-3 ml-4">
          <a
            href="#"
            className="text-blue-300 hover:text-blue-100 transition-colors"
            aria-label="Twitter/X"
          >
            <Twitter size={20} />
          </a>
          <a
            href="#"
            className="text-blue-300 hover:text-blue-100 transition-colors"
            aria-label="Telegram"
          >
            <Send size={20} />
          </a>
        </div>

        <WalletMultiButton />
      </div>
    </header>
  );
}

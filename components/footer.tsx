import { Twitter, Send, ExternalLink, ExpandIcon } from "lucide-react";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="relative z-10 mt-auto border-t border-blue-900/30 bg-black/30 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Image height={40} width={40} src="/logo.png" alt="LOGO" />
            <span className="text-lg font-bold text-blue-200">MOONBETS</span>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-6">
            <a
              href="https://x.com/MOONBETS_"
              target="_blank"
              className="flex items-center gap-2 text-blue-300 hover:text-blue-100 transition-colors"
              aria-label="Follow us on Twitter/X"
            >
              <Twitter size={18} />
              <span className="text-sm">Follow us on X</span>
            </a>

            <a
              href="https://t.me/MOONBETS_CASINO"
              target="_blank"
              className="flex items-center gap-2 text-blue-300 hover:text-blue-100 transition-colors"
              aria-label="Join our Telegram"
            >
              <Send size={18} />
              <span className="text-sm">Join Telegram</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-2 text-blue-300 hover:text-blue-100 transition-colors"
              aria-label="Follow us on Twitter/X"
            >
              <ExternalLink size={18} />
              <span className="text-sm">Docs</span>
            </a>

            <a
              href="#"
              className="flex items-center gap-2 text-blue-300 hover:text-blue-100 transition-colors"
              aria-label="Join our Telegram"
            >
              <ExternalLink size={18} />
              <span className="text-sm">Proof Of Fairness</span>
            </a>
          </div>

          <div className="mt-4 md:mt-0 text-xs text-gray-500">
            &copy; {new Date().getFullYear()} MoonBets. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}

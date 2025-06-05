import { Twitter, Send, ExternalLink, ExpandIcon } from "lucide-react";
import Image from "next/image";

export default function Footer() {
	return (
		<footer className="relative z-10 mt-auto">
			<div className="container mx-auto px-4 py-6">
				<div className="flex flex-col justify-between items-center">
					<div className="flex items-center ">
						<Image height={100} width={100} src="/logo.webp" alt="LOGO" />
					</div>

					<div className="flex flex-wrap justify-center items-center gap-4">
						<a
							href="https://x.com/MOONBETS_"
							target="_blank"
							className="flex items-center gap-2 text-blue-300 hover:text-blue-100 transition-colors"
							aria-label="Follow us on Twitter/X"
						>
							<Image src="/twitter.webp" width={25} height={25} alt="twitter" />
							<span className="text-sm">Follow us on X</span>
						</a>

						<a
							href="https://t.me/MoonBets_CASINO"
							target="_blank"
							className="flex items-center gap-2 text-blue-300 hover:text-blue-100 transition-colors"
							aria-label="Join our Telegram"
						>
							<Image
								src="/telegram.webp"
								width={25}
								height={25}
								alt="telegram"
							/>
							<span className="text-sm">Join Telegram</span>
						</a>
						<a
							href="https://Guide.moonbets.casino"
							className="flex items-center gap-2 text-blue-300 hover:text-blue-100 transition-colors"
							aria-label="Follow us on Twitter/X"
						>
							<Image
								src="/external_link.webp"
								width={25}
								height={25}
								alt="Docs"
							/>
							<span className="text-sm">Docs</span>
						</a>

						<a
							href="https://guide.moonbets.casino/getting-started/quickstart-1"
							className="flex items-center gap-2 text-blue-300 hover:text-blue-100 transition-colors"
							aria-label="Join our Telegram"
						>
							<Image
								src="/external_link.webp"
								width={25}
								height={25}
								alt="Proof of fairness"
							/>
							<span className="text-sm">Proof Of Fairness</span>
						</a>
					</div>
				</div>
			</div>
		</footer>
	);
}

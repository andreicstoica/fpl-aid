import { Settings } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/utils/auth-client";
import { SettingsSheet } from "./SettingsSheet";

export function Header() {
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	const { data: session } = authClient.useSession();

	const handleSettingsClick = () => {
		if (session?.user) {
			setIsSettingsOpen(true);
		}
	};

	const handleSettingsOpenChange = (open: boolean) => {
		if (!open || session?.user) {
			setIsSettingsOpen(open);
		}
	};

	return (
		<>
			<header className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
				<div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between">
						<h1 className="text-2xl font-bold">Transfer Tactician</h1>
						{session?.user && (
							<Button
								variant="ghost"
								size="icon"
								onClick={handleSettingsClick}
								className="h-9 w-9 sm:h-10 sm:w-10"
							>
								<Settings className="h-5 w-5 sm:h-6 sm:w-6" />
								<span className="sr-only">Open settings</span>
							</Button>
						)}
					</div>
				</div>
			</header>

			<SettingsSheet
				isOpen={isSettingsOpen && !!session?.user}
				onOpenChange={handleSettingsOpenChange}
			/>
		</>
	);
}

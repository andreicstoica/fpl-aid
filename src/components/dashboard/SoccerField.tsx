import { Card, CardHeader, CardPanel, CardTitle } from "@/components/ui/card";
import type { FplRosterPlayer } from "@/types/fpl";
import { PlayerCard } from "./PlayerCard";

interface SoccerFieldProps {
	roster: FplRosterPlayer[];
}

export function SoccerField({ roster }: SoccerFieldProps) {
	const playersByPosition = roster.reduce(
		(acc, player) => {
			if (!acc[player.position]) {
				acc[player.position] = [];
			}
			acc[player.position].push(player);
			return acc;
		},
		{} as Record<string, FplRosterPlayer[]>,
	);

	const positionOrder = ["GKP", "DEF", "MID", "FWD"] as const;
	const positionNames = {
		GKP: "Goalkeepers",
		DEF: "Defenders",
		MID: "Midfielders",
		FWD: "Forwards",
	};

	return (
		<Card className="border-none bg-transparent p-0 shadow-none">
			<CardHeader className="pb-4">
				<CardTitle className="text-center text-2xl font-semibold text-emerald-900">
					Your Squad
				</CardTitle>
			</CardHeader>
			<CardPanel className="px-0 pb-0">
				<div className="mx-auto">
					<div className="relative rounded-xl shadow-lg p-1.5 md:p-3">
						<div className="relative bg-linear-to-b from-emerald-600 via-emerald-700 to-emerald-800 rounded-lg p-4 md:p-6">
							{/* Pitch Markings */}
							<div className="pointer-events-none absolute inset-0 opacity-20">
								<div className="absolute inset-4 rounded-lg border-2 border-white" />
								<div className="absolute left-1/2 top-4 bottom-4 w-0.5 -translate-x-0.5 bg-white" />
								<div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white" />
							</div>

							{/* Players */}
							<div className="relative z-10 flex flex-col gap-8">
								{positionOrder.map((position) => {
									const players = playersByPosition[position] || [];
									if (players.length === 0) return null;

									return (
										<div key={position} className="space-y-4">
											<h3 className="text-center text-xl font-semibold text-white/90">
												{positionNames[position]}
											</h3>
											<div className="flex flex-wrap justify-center gap-3 md:gap-4 lg:gap-6">
												{players.map((player) => (
													<PlayerCard key={player.id} player={player} />
												))}
											</div>
										</div>
									);
								})}
							</div>
						</div>
					</div>
				</div>
			</CardPanel>
		</Card>
	);
}

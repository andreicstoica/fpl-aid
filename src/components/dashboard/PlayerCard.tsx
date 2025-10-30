import {
	Shield,
	Star,
	TrendingDown,
	Hospital,
	Flag,
	AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { FplRosterPlayer } from "@/types/fpl";
import { getTeamColors } from "@/types/teams";
import { isFormPlummeting } from "@/utils/player-performance";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
	TooltipProvider,
} from "@/components/ui/tooltip";

interface PlayerCardProps {
	player: FplRosterPlayer;
}

function TeamJersey({ team }: { team: string }) {
	const colors = getTeamColors(team);

	return (
		<div className="relative w-12 h-14 mx-auto shrink-0">
			{/* Jersey Body */}
			<div
				className={`absolute inset-0 ${colors.primary} rounded-t-lg border-2 border-gray-400 shadow-sm`}
			>
				<JerseyPattern colors={colors} />
			</div>

			{/* Collar */}
			<div
				className={`absolute top-0 left-1/2 transform -translate-x-1/2 w-4 h-1.5 ${colors.secondary} rounded-t-sm border border-gray-400`}
			/>

			{/* Sleeves */}
			<div
				className={`absolute -left-0.5 top-1 w-1.5 h-3 ${colors.primary} rounded-l-md border border-gray-400`}
			/>
			<div
				className={`absolute -right-0.5 top-1 w-1.5 h-3 ${colors.primary} rounded-r-md border border-gray-400`}
			/>
		</div>
	);
}

function JerseyPattern({
	colors,
}: {
	colors: ReturnType<typeof getTeamColors>;
}) {
	if (colors.pattern === "stripes") {
		return (
			<>
				<div
					className={`absolute left-1 top-1 bottom-1 w-1 ${colors.secondary}`}
				/>
				<div
					className={`absolute left-3 top-1 bottom-1 w-1 ${colors.secondary}`}
				/>
				<div
					className={`absolute right-3 top-1 bottom-1 w-1 ${colors.secondary}`}
				/>
				<div
					className={`absolute right-1 top-1 bottom-1 w-1 ${colors.secondary}`}
				/>
			</>
		);
	}

	if (colors.pattern === "half") {
		return (
			<div
				className={`absolute inset-x-0 top-0 h-1/2 ${colors.secondary} rounded-t-lg`}
			/>
		);
	}

	if (colors.pattern === "navy-trim") {
		return (
			<div className="absolute inset-x-1 top-1 bottom-1 bg-blue-900 opacity-30 rounded" />
		);
	}

	// Default solid pattern - no additional elements needed
	return null;
}

export function PlayerCard({ player }: PlayerCardProps) {
	const stats = [
		{
			label: "Price",
			value: `£${player.price.toFixed(1)}m`,
		},
		{
			label: "Form",
			value: player.form.toFixed(1),
		},
		{
			label: "PPG",
			value: player.pointsPerGame.toFixed(1),
		},
	] as const;

	// Availability and signals
	const status = player.status;
	const news = player.news;
	const showInjury = status === "i";
	const showSuspended = status === "s";
	const showDoubtful = status === "d";
	const showFormTank = isFormPlummeting(player);

	// Extract doubt percentage from news if present (e.g., "75% chance of playing")
	const doubtfulPercent = showDoubtful
		? (() => {
				const match = news?.match(/(\d{1,3})%/);
				const num = match ? Number(match[1]) : undefined;
				return Number.isFinite(num)
					? Math.max(0, Math.min(100, num as number))
					: undefined;
			})()
		: undefined;
	const availabilityBorder =
		showInjury ||
		showSuspended ||
		player.chanceOfPlayingNextRound === 25 ||
		player.chanceOfPlayingNextRound === 0
			? "border-red-400 border-2"
			: player.chanceOfPlayingNextRound === 50 ||
					player.chanceOfPlayingNextRound === 75
				? "border-yellow-400 border-2"
				: "border-white/40";

	return (
		<div className="relative w-full sm:w-52 md:w-56 lg:w-60">
			{(showInjury || showSuspended || showDoubtful || showFormTank) && (
				<TooltipProvider>
					<div className="absolute right-3 top-3 z-20 space-y-2 flex flex-col items-end">
						{showInjury && (
							<Tooltip>
								<TooltipTrigger>
									<Badge
										variant="destructive"
										size="sm"
										className="flex items-center gap-1 shadow-sm cursor-help bg-amber-100 border-amber-400 text-black"
									>
										<Hospital className="h-3 w-3" />
									</Badge>
								</TooltipTrigger>
								<TooltipContent className="px-3 py-2 text-xs font-semibold rounded-lg bg-amber-50 text-black shadow border border-amber-300">
									{news || "Injury"}
								</TooltipContent>
							</Tooltip>
						)}
						{showDoubtful && (
							<Tooltip>
								<TooltipTrigger>
									<Badge
										variant="destructive"
										size="sm"
										className="flex items-center gap-1 shadow-sm cursor-help bg-amber-100 border-amber-400 text-black"
									>
										<AlertTriangle className="h-3 w-3" />
										{typeof doubtfulPercent === "number"
											? `${doubtfulPercent}%`
											: "Doubt"}
									</Badge>
								</TooltipTrigger>
								<TooltipContent className="px-3 py-2 text-xs font-semibold rounded-lg bg-amber-50 text-black shadow border border-amber-300">
									{news || "Doubtful"}
								</TooltipContent>
							</Tooltip>
						)}
						{showSuspended && (
							<Tooltip>
								<TooltipTrigger>
									<Badge
										variant="destructive"
										size="sm"
										className="flex items-center gap-1 shadow-sm cursor-help bg-red-600 text-white border-red-700"
									>
										<Flag className="h-3 w-3" />
									</Badge>
								</TooltipTrigger>
								<TooltipContent className="px-3 py-2 text-xs font-semibold rounded-lg bg-red-50 text-red-900 shadow border border-red-400">
									{news ? `Suspended for: ${news}` : "Suspended"}
								</TooltipContent>
							</Tooltip>
						)}
						{showFormTank && (
							<Tooltip>
								<TooltipTrigger>
									<Badge
										variant="warning"
										size="sm"
										className="flex items-center gap-1 shadow-sm cursor-help bg-yellow-100 border-yellow-300 text-yellow-900"
									>
										<TrendingDown className="h-3 w-3" />
									</Badge>
								</TooltipTrigger>
								<TooltipContent className="px-3 py-2 text-xs font-semibold rounded-lg bg-yellow-50 text-yellow-900 shadow border border-yellow-300">
									{`Form down to ${player.form} (avg: ${player.pointsPerGame}, down ${player.pointsPerGame > 0 ? Math.round(100 * (1 - player.form / player.pointsPerGame)) : 0}%)`}
								</TooltipContent>
							</Tooltip>
						)}
					</div>
				</TooltipProvider>
			)}
			{/* Captain/Vice as left-top badges: keep as-is */}
			{(player.isCaptain || player.isViceCaptain) && (
				<div className="absolute left-3 top-3 z-20 space-y-2">
					{player.isCaptain && (
						<Badge
							variant="warning"
							size="sm"
							className="flex items-center gap-1 shadow-sm"
						>
							<Star className="h-3 w-3" />C
						</Badge>
					)}
					{player.isViceCaptain && (
						<Badge
							variant="secondary"
							size="sm"
							className="flex items-center gap-1 shadow-sm"
						>
							<Shield className="h-3 w-3" />V
						</Badge>
					)}
				</div>
			)}

			<Card
				className={cn(
					"h-auto w-full overflow-hidden rounded-3xl border-2 bg-white/95 px-3 py-4 shadow-[0_1.125rem_2.1875rem_rgba(16,100,47,0.2)] backdrop-blur gap-1",
					availabilityBorder,
				)}
			>
				<div className="flex flex-col gap-1">
					<TeamJersey team={player.team} />

					<div className="text-center">
						<div className="text-xs tracking-wider font-semibold uppercase text-emerald-800/80">
							{player.team}
						</div>
						<div className="mt-0.5 truncate text-base font-semibold text-slate-900">
							{player.name}
						</div>
					</div>
				</div>

				<div className="-mx-0.5 mt-auto flex w-full flex-col gap-1 px-0.5 text-center text-[0.65rem] text-slate-500 sm:flex-row sm:text-xs">
					{stats.map((stat, index) => (
						<div
							key={stat.label}
							className={cn(
								"flex flex-1 flex-col items-center gap-0.5 px-1 py-1.5 min-w-0",
								index > 0 &&
									"border-t-2 border-emerald-100/90 sm:border-t-0 sm:border-l-2",
							)}
						>
							<div className="flex items-center gap-0.5 text-[0.6rem] uppercase tracking-widest text-emerald-700 whitespace-nowrap sm:text-[0.65rem]">
								<span className="truncate">{stat.label}</span>
							</div>
							<div className="w-full truncate text-xs font-semibold text-slate-900 sm:text-sm">
								{stat.value}
							</div>
						</div>
					))}
				</div>
			</Card>
		</div>
	);
}

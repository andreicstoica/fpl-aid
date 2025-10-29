import { Award, BarChart3, Users } from "lucide-react";
import { Card, CardHeader, CardPanel, CardTitle } from "@/components/ui/card";
import type { LeagueComparison } from "@/types/fpl";

interface LeagueStatsProps {
	league: LeagueComparison;
}

export function LeagueStats({ league }: LeagueStatsProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>League Position</CardTitle>
			</CardHeader>
			<CardPanel>
				<div className="space-y-3">
					<div className="flex justify-between items-center">
						<div className="flex items-center gap-2 text-gray-600">
							<Award className="h-4 w-4" />
							Current Rank:
						</div>
						<span className="font-semibold text-lg">#{league.userRank}</span>
					</div>
					<div className="flex justify-between items-center">
						<div className="flex items-center gap-2 text-gray-600">
							<BarChart3 className="h-4 w-4" />
							{league.rivalAbove.name} Total:
						</div>
						<span className="font-semibold text-lg text-orange-600">
							{league.rivalAbove.points}pts
						</span>
					</div>
					<div className="flex justify-between items-center">
						<div className="flex items-center gap-2 text-gray-600">
							<Users className="h-4 w-4" />
							Behind {league.rivalAbove.name}:
						</div>
						<span className="font-semibold text-lg text-red-600">
							{league.ppwGap < 0
								? `${league.ppwGap.toFixed(1)} PPW`
								: `+${league.ppwGap.toFixed(1)} PPW`}
						</span>
					</div>
				</div>
			</CardPanel>
		</Card>
	);
}

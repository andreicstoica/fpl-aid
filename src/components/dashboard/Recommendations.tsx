import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { RecommendationItem } from "@/types/fpl";

const formatSigned = (value: number, digits = 2) => {
	const factor = 10 ** digits;
	const threshold = 1 / (factor * 2);
	const normalized = Math.abs(value) < threshold ? 0 : value;
	const fixed = normalized.toFixed(digits);
	if (normalized > 0) return `+${fixed}`;
	return fixed;
};

export function Recommendations(props: {
	items?: Array<RecommendationItem> | null;
}) {
	const items = props.items || [];
	if (!items.length)
		return (
			<Card className="p-3 sm:p-4">
				<div className="text-sm font-semibold mb-2">
					Differential suggestions
				</div>
				<div className="text-muted-foreground text-sm">
					No smart transfers to suggest! Your squad looks solid for now.
				</div>
			</Card>
		);
	return (
		<Card className="p-3 sm:p-4">
			<div className="text-sm font-semibold mb-2">Differential suggestions</div>
			<div className="space-y-1">
				{items.map((r) => {
					const rawNetSpend =
						r.netSpend ?? (r.in.price ?? 0) - (r.out.price ?? 0);
					const rawWeeklyDelta =
						r.weeklyPointsDelta ??
						(r.in.pointsPerGame ?? 0) - (r.out.pointsPerGame ?? 0);
					const rawValuePerMillion =
						r.valuePerMillion ??
						rawWeeklyDelta / Math.max(0.1, r.in.price ?? 0);
					const rawNextFixtureDelta =
						r.nextFixtureExpectedDelta ??
						(r.in.expectedPoints ?? 0) - (r.out.expectedPoints ?? 0);
					const netSpend = formatSigned(rawNetSpend, 1);
					const weeklyDelta = formatSigned(rawWeeklyDelta);
					const valuePerMillion = formatSigned(rawValuePerMillion);
					const nextFixtureDelta = formatSigned(rawNextFixtureDelta);
					return (
						<div key={`${r.in.id}-${r.out.id}`} className="text-sm">
							<Badge variant="secondary" className="mr-2">
								{r.score.toFixed(2)}
							</Badge>
							<span>
								IN {r.in.name} → OUT {r.out.name} · £{netSpend}m · ppgΔ:
								{weeklyDelta} val/£m:{valuePerMillion} gwXPΔ:
								{nextFixtureDelta}
							</span>
						</div>
					);
				})}
			</div>
		</Card>
	);
}

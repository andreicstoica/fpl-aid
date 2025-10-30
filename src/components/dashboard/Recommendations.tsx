import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { RecommendationItem } from "@/lib/fpl/recommendations";

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
				{items.map((r, idx) => (
					<div key={idx} className="text-sm">
						<Badge variant="secondary" className="mr-2">
							{r.score.toFixed(2)}
						</Badge>
						<span>
							IN {r.in.name} → OUT {r.out.name} · £
							{(r.in.price - r.out.price).toFixed(1)}m · {r.rationale}
						</span>
					</div>
				))}
			</div>
		</Card>
	);
}

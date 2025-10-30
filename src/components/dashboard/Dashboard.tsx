import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { LeagueStats } from "./LeagueStats";
import { ManagerStats } from "./ManagerStats";
import { SoccerField } from "./SoccerField";
import { Recommendations } from "./Recommendations";

export function Dashboard() {
	const {
		data: dashboardData,
		isLoading: dashboardLoading,
		error: dashboardError,
	} = useQuery({
		queryKey: ["fpl-dashboard"],
		queryFn: async () => {
			const response = await fetch("/api/fpl-dashboard");
			if (!response.ok) throw new Error("Failed to fetch dashboard data");
			return response.json();
		},
		retry: false,
	});

	if (dashboardLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center py-8">
				<div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
					<Skeleton className="mx-auto mb-8 h-10 w-full max-w-xs sm:max-w-sm" />
					<div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
						<Skeleton className="h-48 w-full sm:h-56" />
						<Skeleton className="h-48 w-full sm:h-56" />
					</div>
					<Skeleton className="h-80 w-full sm:h-96" />
				</div>
			</div>
		);
	}
	if (dashboardError) {
		return (
			<div className="min-h-screen flex items-center justify-center py-8">
				<div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
					<Alert variant="error" className="max-w-2xl mx-auto">
						<AlertTitle>Error loading dashboard</AlertTitle>
						<AlertDescription>
							{(dashboardError as Error).message}
						</AlertDescription>
					</Alert>
				</div>
			</div>
		);
	}
	if (!dashboardData) {
		return (
			<div className="min-h-screen flex items-center justify-center py-8">
				<div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
					<Empty>
						<EmptyHeader>
							<EmptyTitle>No dashboard data available</EmptyTitle>
							<EmptyDescription>
								Please check your FPL team connection.
							</EmptyDescription>
						</EmptyHeader>
					</Empty>
				</div>
			</div>
		);
	}

	const { roster, manager, league } = dashboardData;
	return (
		<div className="min-h-screen py-8 sm:py-10">
			<div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
				{/* Stats Row */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
					{manager && <ManagerStats manager={manager} />}
					{league && <LeagueStats league={league} />}
				</div>
				{/* Recommendations under stats */}
				<Recommendations items={dashboardData.recommendations || null} />
				{/* Soccer Field */}
				<SoccerField roster={roster} />
			</div>
		</div>
	);
}

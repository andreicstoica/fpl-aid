import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { LogOut, Save } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "@/components/ui/toast";
import { authClient } from "@/utils/auth-client";

interface SettingsSheetProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
}

export function SettingsSheet({ isOpen, onOpenChange }: SettingsSheetProps) {
	const { data: session, refetch: refetchSession } = authClient.useSession();
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const [fplTeamId, setFplTeamId] = useState("");
	const [fplLeagueId, setFplLeagueId] = useState("");
	const [isSaving, setIsSaving] = useState(false);
	const emailId = useId();
	const fplTeamInputId = useId();
	const fplLeagueInputId = useId();

	// Fetch user FPL settings from database
	const { data: userSettings } = useQuery({
		queryKey: ["user-settings"],
		queryFn: async () => {
			const response = await fetch("/api/user-settings");
			if (!response.ok) {
				throw new Error("Failed to fetch settings");
			}
			return response.json() as Promise<{
				fplTeamId: string;
				fplLeagueId: string;
			}>;
		},
		enabled: !!session?.user && isOpen,
	});

	const updateSettingsMutation = useMutation({
		mutationFn: async (data: { fplTeamId: string; fplLeagueId: string }) => {
			const response = await fetch("/api/update-user-settings", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
				credentials: "include",
			});

			if (!response.ok) {
				throw new Error("Failed to update settings");
			}

			return response.json();
		},
		onSuccess: async () => {
			// Refetch user settings and dashboard queries
			await Promise.all([
				refetchSession(),
				queryClient.invalidateQueries({ queryKey: ["user-settings"] }),
				queryClient.invalidateQueries({ queryKey: ["fpl-dashboard"] }),
			]);

			toast({
				title: "Settings updated",
				description: "Your FPL settings have been saved successfully.",
				type: "success",
			});
			onOpenChange(false);
		},
		onError: (error) => {
			toast({
				title: "Error",
				description: error.message || "Failed to update settings",
				type: "error",
			});
		},
	});

	const handleSave = async () => {
		if (!fplTeamId.trim() || !fplLeagueId.trim()) {
			toast({
				title: "Invalid input",
				description: "Please enter both Team ID and League ID",
				type: "error",
			});
			return;
		}

		setIsSaving(true);
		try {
			await updateSettingsMutation.mutateAsync({
				fplTeamId: fplTeamId.trim(),
				fplLeagueId: fplLeagueId.trim(),
			});
		} finally {
			setIsSaving(false);
		}
	};

	const handleLogout = async () => {
		try {
			// Sign out and clear session
			await authClient.signOut();

			// Force session refetch to ensure it's cleared
			await refetchSession();

			// Clear all React Query cache
			queryClient.clear();

			// Close settings sheet
			onOpenChange(false);

			// Navigate to root page
			navigate({ to: "/" });

			toast({
				title: "Logged out",
				description: "You have been successfully logged out.",
				type: "success",
			});
		} catch (_error) {
			toast({
				title: "Error",
				description: "Failed to logout",
				type: "error",
			});
		}
	};

	// Update local state when user settings are fetched or sheet opens
	useEffect(() => {
		if (isOpen && userSettings) {
			setFplTeamId(userSettings.fplTeamId || "");
			setFplLeagueId(userSettings.fplLeagueId || "");
		} else if (!isOpen) {
			// Reset form when sheet closes
			setFplTeamId("");
			setFplLeagueId("");
		}
	}, [isOpen, userSettings]);

	return (
		<Sheet open={isOpen} onOpenChange={onOpenChange}>
			<SheetContent>
				<SheetHeader>
					<SheetTitle>Settings</SheetTitle>
					<SheetDescription>
						Manage your account settings and FPL team information.
					</SheetDescription>
				</SheetHeader>

				<div className="flex-1 space-y-6 overflow-y-auto p-4">
					{/* User Info */}
					<div className="space-y-2">
						<Label htmlFor={emailId}>Email</Label>
						<Input
							id={emailId}
							value={session?.user?.email || ""}
							disabled
							className="bg-muted"
						/>
						<p className="text-sm text-muted-foreground">
							Your email address cannot be changed here.
						</p>
					</div>

					<Separator />

					{/* FPL Settings */}
					<div className="space-y-6">
						<h3 className="text-lg font-medium">FPL Settings</h3>

						<div className="space-y-2">
							<Label htmlFor={fplTeamInputId}>FPL Team ID</Label>
							<Input
								id={fplTeamInputId}
								value={fplTeamId}
								onChange={(e) => setFplTeamId(e.target.value)}
								placeholder="Enter your FPL Team ID"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor={fplLeagueInputId}>FPL League ID</Label>
							<Input
								id={fplLeagueInputId}
								value={fplLeagueId}
								onChange={(e) => setFplLeagueId(e.target.value)}
								placeholder="Enter your FPL League ID"
							/>
						</div>
					</div>
				</div>

				<SheetFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
					<Button
						onClick={handleSave}
						disabled={isSaving}
						className="w-full sm:w-auto"
					>
						<Save className="mr-2 h-4 w-4" />
						{isSaving ? "Saving..." : "Save Changes"}
					</Button>

					<Button
						variant="destructive"
						onClick={handleLogout}
						className="w-full sm:w-auto"
					>
						<LogOut className="mr-2 h-4 w-4" />
						Logout
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}

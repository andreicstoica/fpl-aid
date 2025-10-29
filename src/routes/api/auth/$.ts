import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@/utils/auth";

export const Route = createFileRoute("/api/auth/$")({
	server: {
		handlers: {
			ANY: async ({ request }) => {
				return auth.handler(request);
			},
		},
	},
});

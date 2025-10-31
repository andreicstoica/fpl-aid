import { createFileRoute } from "@tanstack/react-router";
import { DateTime } from "luxon";
import {
	type FplDeadlineAlertPayload,
	parseFplDeadlineAlertPayload,
	redactAlertForLogs,
	verifyWebhookAuthorization,
	verifyWebhookSignature,
} from "@/integrations/valtown/cron-alerts";
import {
	evaluateRecipientNotification,
	type NotificationRecipient,
	serializeNotificationPlan,
} from "@/lib/alerts/scheduling";

export const Route = createFileRoute("/api/webhooks/fpl-deadline")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const expectedAuth = process.env.ALERT_WEBHOOK_AUTH;
				if (!verifyWebhookAuthorization(request, expectedAuth)) {
					return new Response("unauthorized", { status: 401 });
				}

				const rawBody = await request.text();

				const signingSecret = process.env.ALERT_WEBHOOK_SIGNING_SECRET;
				if (!verifyWebhookSignature(request, rawBody, signingSecret)) {
					return new Response("bad signature", { status: 401 });
				}

				let alert: FplDeadlineAlertPayload;
				try {
					alert = parseFplDeadlineAlertPayload(rawBody);
				} catch (error) {
					return Response.json(
						{ ok: false, error: (error as Error).message },
						{ status: 400 },
					);
				}

				const recipients = await loadRecipientsForAlert(alert);
				const now = DateTime.utc();
				const plans = recipients.map((recipient) =>
					evaluateRecipientNotification({ alert, recipient, now }),
				);
				const serializedPlans = plans.map(serializeNotificationPlan);

				const sendNowCount = serializedPlans.filter(
					(plan) => plan.action === "send-now",
				).length;
				const scheduleCount = serializedPlans.filter(
					(plan) => plan.action === "schedule",
				).length;
				const skipCount = serializedPlans.filter(
					(plan) => plan.action === "skip",
				).length;

				return Response.json({
					ok: true,
					alert: redactAlertForLogs(alert),
					summary: {
						recipients: recipients.length,
						sendNow: sendNowCount,
						schedule: scheduleCount,
						skipped: skipCount,
					},
					plans: serializedPlans,
				});
			},
		},
	},
});

async function loadRecipientsForAlert(
	_alert: FplDeadlineAlertPayload,
): Promise<NotificationRecipient[]> {
	// TODO: replace placeholder logic with database-backed recipient fetching.
	return [];
}

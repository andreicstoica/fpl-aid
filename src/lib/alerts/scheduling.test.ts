import { describe, expect, it } from "vitest";
import { DateTime } from "luxon";
import type { FplDeadlineAlertPayload } from "@/integrations/valtown/cron-alerts";
import {
	evaluateRecipientNotification,
	serializeNotificationPlan,
	getCurrentWindow,
	isInWindow,
	type NotificationRecipient,
} from "./scheduling.ts";

function buildAlert(
	overrides: Partial<FplDeadlineAlertPayload> = {},
): FplDeadlineAlertPayload {
	return {
		type: "fpl_deadline_alert",
		gameweekId: 12,
		gameweekName: "Gameweek 12",
		deadlineISO: "2025-11-08T11:00:00.000Z",
		deadlineEpochMs: Date.parse("2025-11-08T11:00:00.000Z"),
		hoursLeft: 24,
		matchedThreshold: 24,
		subject: "Test alert",
		body: "Body",
		trigger: { type: "lead_hours", leadHours: 60, forced: false },
		source: { provider: "test", endpoint: "/api" },
		...overrides,
	};
}

function buildRecipient(
	overrides: Partial<NotificationRecipient> = {},
): NotificationRecipient {
	return {
		id: "user-1",
		email: "user@example.com",
		timeZone: "America/New_York",
		windowStart: "19:00",
		windowEnd: "21:00",
		lastSentGameweekId: null,
		...overrides,
	};
}

describe("evaluateRecipientNotification", () => {
	it("schedules when outside the preferred window", () => {
		const alert = buildAlert();
		const recipient = buildRecipient();
		const now = DateTime.fromISO("2025-11-07T16:00:00.000Z"); // 11:00 local time

		const plan = evaluateRecipientNotification({ alert, recipient, now });

		expect(plan.action).toBe("schedule");
		expect(plan.sendAt?.toISO()).toBe("2025-11-07T19:00:00.000-05:00");
		expect(plan.reason).toBe("window-future");
	});

	it("sends immediately when already inside the window", () => {
		const alert = buildAlert();
		const recipient = buildRecipient();
		const now = DateTime.fromISO("2025-11-08T00:30:00.000Z"); // 19:30 previous evening local

		const plan = evaluateRecipientNotification({ alert, recipient, now });

		expect(plan.action).toBe("send-now");
		expect(plan.reason).toBe("inside-window");
		expect(plan.sendAt?.toISO()).toBe("2025-11-07T19:30:00.000-05:00");
	});

	it("sends immediately when the window has passed", () => {
		const alert = buildAlert();
		const recipient = buildRecipient();
		const now = DateTime.fromISO("2025-11-08T04:00:00.000Z"); // After 23:00 local

		const plan = evaluateRecipientNotification({ alert, recipient, now });

		expect(plan.action).toBe("send-now");
		expect(plan.reason).toBe("window-missed");
		expect(plan.sendAt?.toISO()).toBe("2025-11-07T23:00:00.000-05:00");
	});

	it("skips when the recipient was already notified for the gameweek", () => {
		const alert = buildAlert();
		const recipient = buildRecipient({ lastSentGameweekId: 12 });
		const now = DateTime.fromISO("2025-11-07T16:00:00.000Z");

		const plan = evaluateRecipientNotification({ alert, recipient, now });

		expect(plan.action).toBe("skip");
		expect(plan.reason).toBe("already-sent");
	});

	it("supports windows that cross midnight", () => {
		const alert = buildAlert();
		const recipient = buildRecipient({
			windowStart: "22:00",
			windowEnd: "01:00",
		});
		const now = DateTime.fromISO("2025-11-07T19:00:00.000Z"); // 14:00 local time

		const plan = evaluateRecipientNotification({ alert, recipient, now });

		expect(plan.action).toBe("schedule");
		expect(plan.sendAt?.toISO()).toBe("2025-11-07T22:00:00.000-05:00");
	});

	it("serializes plans with UTC and local timestamps", () => {
		const alert = buildAlert();
		const recipient = buildRecipient();
		const now = DateTime.fromISO("2025-11-07T18:00:00.000Z");

		const plan = evaluateRecipientNotification({ alert, recipient, now });
		const serialized = serializeNotificationPlan(plan);

		expect(serialized.action).toBe("schedule");
		expect(serialized.sendAtUtc).toBe("2025-11-08T00:00:00.000Z");
		expect(serialized.sendAtLocal).toBe("2025-11-07T19:00:00.000-05:00");
		expect(serialized.windowStartLocal).toBe("2025-11-07T19:00:00.000-05:00");
		expect(serialized.windowEndLocal).toBe("2025-11-07T21:00:00.000-05:00");
	});
});

describe("getCurrentWindow", () => {
	it("computes window as deadline minus hours before", () => {
		const now = DateTime.fromISO("2025-11-07T10:00:00.000Z");
		const deadlineEpochMs = DateTime.fromISO(
			"2025-11-08T12:00:00.000Z",
		).toMillis();
		const hoursBefore = 14;

		const window = getCurrentWindow(now, deadlineEpochMs, hoursBefore);

		expect(window.startUtc.toISO()).toBe("2025-11-07T22:00:00.000Z");
		expect(window.endUtc.toISO()).toBe("2025-11-08T12:00:00.000Z");
	});

	it("handles short windows", () => {
		const now = DateTime.fromISO("2025-11-07T10:00:00.000Z");
		const deadlineEpochMs = DateTime.fromISO(
			"2025-11-07T12:00:00.000Z",
		).toMillis();
		const hoursBefore = 1;

		const window = getCurrentWindow(now, deadlineEpochMs, hoursBefore);

		expect(window.startUtc.toISO()).toBe("2025-11-07T11:00:00.000Z");
		expect(window.endUtc.toISO()).toBe("2025-11-07T12:00:00.000Z");
	});
});

describe("isInWindow", () => {
	it("returns true when now is within window", () => {
		const now = DateTime.fromISO("2025-11-07T23:00:00.000Z");
		const window = {
			startUtc: DateTime.fromISO("2025-11-07T22:00:00.000Z"),
			endUtc: DateTime.fromISO("2025-11-08T12:00:00.000Z"),
		};

		expect(isInWindow(now, window)).toBe(true);
	});

	it("returns false when now is before window", () => {
		const now = DateTime.fromISO("2025-11-07T20:00:00.000Z");
		const window = {
			startUtc: DateTime.fromISO("2025-11-07T22:00:00.000Z"),
			endUtc: DateTime.fromISO("2025-11-08T12:00:00.000Z"),
		};

		expect(isInWindow(now, window)).toBe(false);
	});

	it("returns false when now is at or after window end", () => {
		const now = DateTime.fromISO("2025-11-08T12:00:00.000Z");
		const window = {
			startUtc: DateTime.fromISO("2025-11-07T22:00:00.000Z"),
			endUtc: DateTime.fromISO("2025-11-08T12:00:00.000Z"),
		};

		expect(isInWindow(now, window)).toBe(false);
	});

	it("returns true when now exactly equals start", () => {
		const now = DateTime.fromISO("2025-11-07T22:00:00.000Z");
		const window = {
			startUtc: DateTime.fromISO("2025-11-07T22:00:00.000Z"),
			endUtc: DateTime.fromISO("2025-11-08T12:00:00.000Z"),
		};

		expect(isInWindow(now, window)).toBe(true);
	});
});

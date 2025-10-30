import { DateTime } from "luxon";
import type { FplDeadlineAlertPayload } from "@/integrations/valtown/cron-alerts";

export interface NotificationRecipient {
	id: string;
	email: string;
	timeZone: string;
	windowStart: string;
	windowEnd: string;
	lastSentGameweekId?: number | null;
	disabled?: boolean;
}

export type NotificationAction = "send-now" | "schedule" | "skip";

export type NotificationReason =
	| "already-sent"
	| "recipient-disabled"
	| "inside-window"
	| "window-future"
	| "window-missed";

export interface NotificationPlan {
	gameweekId: number;
	recipient: NotificationRecipient;
	action: NotificationAction;
	sendAt: DateTime | null;
	windowStart: DateTime;
	windowEnd: DateTime;
	reason?: NotificationReason;
}

export interface SerializedNotificationPlan {
	gameweekId: number;
	recipientId: string;
	action: NotificationAction;
	reason?: NotificationReason;
	timeZone: string;
	sendAtUtc?: string;
	sendAtLocal?: string;
	windowStartUtc: string;
	windowStartLocal: string;
	windowEndUtc: string;
	windowEndLocal: string;
}

const WINDOW_TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

function parseWindowTime(value: string) {
	const trimmed = value.trim();
	const match = WINDOW_TIME_REGEX.exec(trimmed);
	if (!match) {
		throw new Error(
			`Invalid time window value "${value}". Expected HH:MM format.`,
		);
	}
	return {
		hour: Number.parseInt(match[1], 10),
		minute: Number.parseInt(match[2], 10),
	};
}

export function computeEveningBeforeWindow(
	alert: FplDeadlineAlertPayload,
	recipient: NotificationRecipient,
) {
	const deadlineLocal = DateTime.fromMillis(alert.deadlineEpochMs, {
		zone: recipient.timeZone,
	});
	if (!deadlineLocal.isValid) {
		throw new Error(
			`Invalid deadline or timezone for recipient ${recipient.id}: ${deadlineLocal.invalidReason ?? "unknown error"}`,
		);
	}

	const windowBase = deadlineLocal.startOf("day").minus({ days: 1 });
	const startTime = parseWindowTime(recipient.windowStart);
	const endTime = parseWindowTime(recipient.windowEnd);

	let windowStart = windowBase.set({
		hour: startTime.hour,
		minute: startTime.minute,
		second: 0,
		millisecond: 0,
	});

	let windowEnd = windowBase.set({
		hour: endTime.hour,
		minute: endTime.minute,
		second: 0,
		millisecond: 0,
	});

	if (!windowStart.isValid) {
		throw new Error(
			`Unable to compute window start for recipient ${recipient.id}: ${windowStart.invalidReason ?? "unknown error"}`,
		);
	}

	if (!windowEnd.isValid) {
		throw new Error(
			`Unable to compute window end for recipient ${recipient.id}: ${windowEnd.invalidReason ?? "unknown error"}`,
		);
	}

	if (windowEnd <= windowStart) {
		windowEnd = windowEnd.plus({ days: 1 });
	}

	return { windowStart, windowEnd };
}

export function evaluateRecipientNotification({
	alert,
	recipient,
	now = DateTime.utc(),
}: {
	alert: FplDeadlineAlertPayload;
	recipient: NotificationRecipient;
	now?: Date | DateTime;
}): NotificationPlan {
	const { windowStart, windowEnd } = computeEveningBeforeWindow(
		alert,
		recipient,
	);

	const disabled = recipient.disabled ?? false;
	if (disabled) {
		return {
			gameweekId: alert.gameweekId,
			recipient,
			action: "skip",
			sendAt: null,
			windowStart,
			windowEnd,
			reason: "recipient-disabled",
		};
	}

	if (
		recipient.lastSentGameweekId !== undefined &&
		recipient.lastSentGameweekId !== null &&
		recipient.lastSentGameweekId >= alert.gameweekId
	) {
		return {
			gameweekId: alert.gameweekId,
			recipient,
			action: "skip",
			sendAt: null,
			windowStart,
			windowEnd,
			reason: "already-sent",
		};
	}

	const effectiveNow = DateTime.isDateTime(now)
		? now
		: DateTime.fromJSDate(now, { zone: "utc" });
	const nowInRecipientZone = effectiveNow.setZone(recipient.timeZone);
	if (!nowInRecipientZone.isValid) {
		throw new Error(
			`Unable to convert current time for recipient ${recipient.id}: ${nowInRecipientZone.invalidReason ?? "unknown error"}`,
		);
	}

	if (nowInRecipientZone < windowStart) {
		return {
			gameweekId: alert.gameweekId,
			recipient,
			action: "schedule",
			sendAt: windowStart,
			windowStart,
			windowEnd,
			reason: "window-future",
		};
	}

	if (nowInRecipientZone <= windowEnd) {
		return {
			gameweekId: alert.gameweekId,
			recipient,
			action: "send-now",
			sendAt: nowInRecipientZone,
			windowStart,
			windowEnd,
			reason: "inside-window",
		};
	}

	return {
		gameweekId: alert.gameweekId,
		recipient,
		action: "send-now",
		sendAt: nowInRecipientZone,
		windowStart,
		windowEnd,
		reason: "window-missed",
	};
}

export function serializeNotificationPlan(
	plan: NotificationPlan,
): SerializedNotificationPlan {
	const sendAtUtc = plan.sendAt?.toUTC().toISO();
	const sendAtLocal = plan.sendAt?.setZone(plan.recipient.timeZone).toISO();

	return {
		gameweekId: plan.gameweekId,
		recipientId: plan.recipient.id,
		action: plan.action,
		reason: plan.reason,
		timeZone: plan.recipient.timeZone,
		sendAtUtc: sendAtUtc ?? undefined,
		sendAtLocal: sendAtLocal ?? undefined,
		windowStartUtc: plan.windowStart.toUTC().toISO(),
		windowStartLocal: plan.windowStart.setZone(plan.recipient.timeZone).toISO(),
		windowEndUtc: plan.windowEnd.toUTC().toISO(),
		windowEndLocal: plan.windowEnd.setZone(plan.recipient.timeZone).toISO(),
	};
}

/**
 * Compute current gameweek send window from deadline and hours-before preference.
 * Used by fpl-ready endpoint to determine if now is within a user's preferred window.
 */
export function getCurrentWindow(
	now: DateTime,
	deadlineEpochMs: number,
	hoursBefore: number,
): { startUtc: DateTime; endUtc: DateTime } {
	const deadline = DateTime.fromMillis(deadlineEpochMs, { zone: "utc" });
	const startUtc = deadline.minus({ hours: hoursBefore });
	const endUtc = deadline;

	return { startUtc, endUtc };
}

/**
 * Check if a timestamp falls within a window (inclusive start, exclusive end at deadline).
 */
export function isInWindow(
	now: DateTime,
	window: { startUtc: DateTime; endUtc: DateTime },
): boolean {
	return now >= window.startUtc && now < window.endUtc;
}

/**
 * Compute user-specific send window using recipient preferences.
 * Simplified version for fpl-ready: assumes all users want X hours before deadline.
 */
export function computeUserSendWindow(
	recipient: NotificationRecipient,
	deadlineEpochMs: number,
	defaultHoursBefore: number,
): { startUtc: DateTime; endUtc: DateTime } {
	// For v1, treat recipient as if they all want default hours before deadline
	// This will be extended when we add user-specific preferences
	return getCurrentWindow(DateTime.utc(), deadlineEpochMs, defaultHoursBefore);
}

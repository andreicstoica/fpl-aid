import { createHash, timingSafeEqual } from "node:crypto";

export const VALTOWN_ALERT_TYPE = "fpl_deadline_alert" as const;

export interface FplDeadlineAlertTrigger {
	type: string;
	leadHours?: number;
	forced?: boolean;
}

export interface FplDeadlineAlertSource {
	provider?: string;
	endpoint?: string;
}

export interface FplDeadlineAlertPayload {
	type: typeof VALTOWN_ALERT_TYPE;
	gameweekId: number;
	gameweekName: string;
	deadlineISO: string;
	deadlineEpochMs: number;
	hoursLeft: number;
	matchedThreshold: number;
	subject: string;
	body: string;
	trigger?: FplDeadlineAlertTrigger;
	source?: FplDeadlineAlertSource;
}

const AUTH_HEADER = "authorization";
const SIGNATURE_HEADER = "x-signature-sha256";

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function toSha256Hex(input: string) {
	return createHash("sha256").update(input).digest("hex");
}

function safeEqualStrings(expected: string, provided: string) {
	const expectedBuffer = Buffer.from(expected);
	const providedBuffer = Buffer.from(provided);
	if (expectedBuffer.length !== providedBuffer.length) {
		return false;
	}
	return timingSafeEqual(expectedBuffer, providedBuffer);
}

export function verifyWebhookAuthorization(
	request: Request,
	expectedAuthValue: string | undefined,
) {
	if (!expectedAuthValue) {
		return true;
	}
	const provided = request.headers.get(AUTH_HEADER);
	if (!provided) {
		return false;
	}
	return safeEqualStrings(expectedAuthValue, provided);
}

export function verifyWebhookSignature(
	request: Request,
	rawBody: string,
	signingSecret: string | undefined,
) {
	if (!signingSecret) {
		return true;
	}
	const provided = request.headers.get(SIGNATURE_HEADER);
	if (!provided) {
		return false;
	}
	const expected = toSha256Hex(`${signingSecret}:${rawBody}`);
	return safeEqualStrings(expected, provided);
}

function requireStringField(
	data: Record<string, unknown>,
	key: string,
	errorMessage?: string,
) {
	const value = data[key];
	if (typeof value !== "string" || value.length === 0) {
		throw new Error(
			errorMessage ?? `Invalid payload: "${key}" must be a non-empty string`,
		);
	}
	return value;
}

function requireNumberField(
	data: Record<string, unknown>,
	key: string,
	errorMessage?: string,
) {
	const value = data[key];
	if (typeof value !== "number" || Number.isNaN(value)) {
		throw new Error(
			errorMessage ?? `Invalid payload: "${key}" must be a number`,
		);
	}
	return value;
}

export function parseFplDeadlineAlertPayload(
	rawBody: string,
): FplDeadlineAlertPayload {
	let parsed: unknown;
	try {
		parsed = JSON.parse(rawBody);
	} catch (error) {
		throw new Error(`Invalid JSON payload: ${(error as Error).message}`);
	}

	if (!isRecord(parsed)) {
		throw new Error("Invalid payload: expected an object");
	}

	const type = requireStringField(parsed, "type");
	if (type !== VALTOWN_ALERT_TYPE) {
		throw new Error(`Invalid payload: unsupported alert type "${type}"`);
	}

	const gameweekId = requireNumberField(parsed, "gameweekId");
	const gameweekName = requireStringField(parsed, "gameweekName");
	const deadlineISO = requireStringField(parsed, "deadlineISO");
	const deadlineEpochMs = requireNumberField(parsed, "deadlineEpochMs");
	const hoursLeft = requireNumberField(parsed, "hoursLeft");
	const matchedThreshold = requireNumberField(parsed, "matchedThreshold");
	const subject = requireStringField(parsed, "subject");
	const body = requireStringField(parsed, "body");

	let trigger: FplDeadlineAlertTrigger | undefined;
	if (parsed.trigger !== undefined) {
		if (!isRecord(parsed.trigger)) {
			throw new Error(
				"Invalid payload: trigger must be an object when provided",
			);
		}
		const triggerType = requireStringField(parsed.trigger, "type");
		const leadHoursValue = parsed.trigger.leadHours;
		const forcedValue = parsed.trigger.forced;
		trigger = {
			type: triggerType,
			leadHours:
				typeof leadHoursValue === "number" && !Number.isNaN(leadHoursValue)
					? leadHoursValue
					: undefined,
			forced: typeof forcedValue === "boolean" ? forcedValue : undefined,
		};
	}

	let source: FplDeadlineAlertSource | undefined;
	if (parsed.source !== undefined) {
		if (!isRecord(parsed.source)) {
			throw new Error(
				"Invalid payload: source must be an object when provided",
			);
		}
		source = {
			provider:
				typeof parsed.source.provider === "string"
					? parsed.source.provider
					: undefined,
			endpoint:
				typeof parsed.source.endpoint === "string"
					? parsed.source.endpoint
					: undefined,
		};
	}

	return {
		type,
		gameweekId,
		gameweekName,
		deadlineISO,
		deadlineEpochMs,
		hoursLeft,
		matchedThreshold,
		subject,
		body,
		trigger,
		source,
	};
}

export function redactAlertForLogs(alert: FplDeadlineAlertPayload) {
	return {
		type: alert.type,
		gameweekId: alert.gameweekId,
		gameweekName: alert.gameweekName,
		deadlineISO: alert.deadlineISO,
		hoursLeft: alert.hoursLeft,
		trigger: alert.trigger,
		source: alert.source,
	};
}

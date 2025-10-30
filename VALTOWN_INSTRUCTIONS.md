# Val Town Cron Migration Instructions

## Overview

Update your Val Town cron to use the new `/api/alerts/fpl-ready` endpoint. This returns personalized alerts with player risk information, letting Val Town handle scheduling and email delivery.

## Step 1: Update Environment Variables

Add these to your Val:

- `APP_ORIGIN`: Your app URL (e.g., `https://yourapp.com`)
- `ALERT_WEBHOOK_SHARED_SECRET`: Same secret used in your app's `ALERT_WEBHOOK_SHARED_SECRET` env

Remove or keep these (your choice):

- `EMAIL_RECIPIENTS`: No longer needed (users come from the API)
- `ALERT_LEAD_HOURS`: Your app handles window logic now
- `ALERT_WEBHOOK_URL`: Keep this if you want dual notifications

## Step 2: Replace Your Cron Handler

Replace your existing cron handler with this code:

```ts
// FPL Alert Cron
// @ts-ignore
import { email } from "https://esm.town/v/std/email";
import { blob } from "https://esm.town/v/std/blob";

declare const Deno: { env: { get: (key: string) => string | undefined } };

function getEnv(name: string): string | undefined {
	try {
		return Deno.env.get(name) ?? undefined;
	} catch {
		return undefined;
	}
}

const ALERT_STATE_KEY = "fpl_alert_send_state_v1";

interface AlertState {
	lastSent: Record<string, number>; // userId -> gameweek
}

async function readAlertState(): Promise<AlertState> {
	try {
		const state = await blob.getJSON<AlertState>(ALERT_STATE_KEY);
		return state || { lastSent: {} };
	} catch {
		return { lastSent: {} };
	}
}

async function writeAlertState(state: AlertState): Promise<void> {
	await blob.setJSON(ALERT_STATE_KEY, state);
}

function getBadgeEmoji(badge: string): string {
	switch (badge) {
		case "injured": return "🤕";
		case "suspended": return "❌";
		case "doubtful": return "⚠️";
		case "form_dip": return "📉";
		case "ok": return "✅";
		default: return "❓";
	}
}

function renderEmailHtml(players: any[], gameweek: number, deadlineUtc: string): string {
	const rows = players.map(p => `
		<tr style="border-bottom: 1px solid #eee;">
			<td style="padding: 8px; font-size: 18px;">${getBadgeEmoji(p.badge)}</td>
			<td style="padding: 8px;"><strong>${p.name}</strong></td>
			<td style="padding: 8px; color: #666;">${p.team}</td>
			<td style="padding: 8px; color: #666;">${p.news || "—"}</td>
		</tr>
	`).join("");

	return `
<!DOCTYPE html>
<html>
<head>
	<style>
		body { font-family: system-ui, -apple-system, sans-serif; }
		table { width: 100%; border-collapse: collapse; margin: 16px 0; }
		th { background: #f5f5f5; padding: 8px; text-align: left; font-weight: 600; }
	</style>
</head>
<body>
	<h3>FPL Gameweek ${gameweek} Squad Alert</h3>
	<p>Deadline: <strong>${new Date(deadlineUtc).toLocaleString()}</strong></p>
	<p>You have ${players.length} player(s) at risk in your squad:</p>
	<table>
		<tr>
			<th>Status</th>
			<th>Player</th>
			<th>Team</th>
			<th>News</th>
		</tr>
		${rows}
	</table>
	<p style="color: #666; font-size: 14px; margin-top: 32px;">
		<a href="https://fantasy.premierleague.com/my-team">Review your squad →</a>
	</p>
</body>
</html>
	`.trim();
}

export default async function () {
	const origin = getEnv("APP_ORIGIN");
	const secret = getEnv("ALERT_WEBHOOK_SHARED_SECRET");

	if (!origin || !secret) {
		return "Missing APP_ORIGIN or ALERT_WEBHOOK_SHARED_SECRET";
	}

	try {
		const res = await fetch(`${origin}/api/alerts/fpl-ready?windowHours=14`, {
			headers: { "x-alert-secret": secret },
		});

		if (!res.ok) {
			console.error(`API returned ${res.status}`);
			return `API error: ${res.status}`;
		}

		const data = await res.json();
		console.log(`${data.recipients.length} recipients ready for GW${data.gameweek}`);

		const state = await readAlertState();
		let sentCount = 0;

		for (const recipient of data.recipients) {
			// Dedupe: skip if already sent for this gameweek
			const key = `${recipient.userId}:${data.gameweek}`;
			if (state.lastSent[recipient.userId] === data.gameweek) {
				console.log(`Skipping ${recipient.email} (already sent for GW${data.gameweek})`);
				continue;
			}

			const html = renderEmailHtml(recipient.players, data.gameweek, data.deadlineUtc);
			await email({
				to: recipient.email,
				subject: `⚠️ FPL GW${data.gameweek} Squad Alert`,
				html,
			});

			state.lastSent[recipient.userId] = data.gameweek;
			sentCount++;
			console.log(`Sent to ${recipient.email}`);
		}

		if (sentCount > 0) {
			await writeAlertState(state);
		}

		return `Sent ${sentCount} alerts for GW${data.gameweek}`;
	} catch (error) {
		console.error("Cron error:", error);
		return `Error: ${error}`;
	}
}
```

## Step 3: Configure Cron Schedule

Set your cron to run every 12 hours. Your app's endpoint is idempotent and only returns users in their send window. With a 14h send window and 12h polling, we'll catch most users within their preferred time while minimizing compute.

Examples:
- "every 12 hours" - recommended (e.g., 00:00 and 12:00 UTC)
- "every 6 hours" - more frequent but probably unnecessary

## Step 4: Test It Out

1. Deploy your new cron val
2. Check the logs to see API calls
3. Send a test with a user who has players at risk
4. Verify emails arrive correctly

## What Changed?

**Old flow:**
1. Cron checks FPL deadline
2. Cron decides who to email
3. Cron sends generic email to all recipients

**New flow:**
1. Cron polls your app's API every 15 min
2. Your app decides who's in their send window + who has player risks
3. API returns personalized recipients + their risk players
4. Cron sends personalized emails
5. Cron dedupes with KV storage

## API Response Format

```json
{
	"gameweek": 12,
	"deadlineUtc": "2025-11-07T18:30:00Z",
	"window": {
		"startUtc": "2025-11-07T04:30:00Z",
		"endUtc": "2025-11-07T18:30:00Z"
	},
	"recipients": [
		{
			"userId": "user-123",
			"email": "user@example.com",
			"players": [
				{
					"id": 123,
					"name": "Salah",
					"team": "LIV",
					"badge": "injured",
					"news": "Hamstring injury — 75% chance of playing"
				}
			]
		}
	]
}
```

## Troubleshooting

**No recipients returned?**

- Check that users have FPL team/league IDs set
- Verify users have players at risk (injury/suspension/doubtful/form dip)
- Confirm it's within their send window (14h before deadline by default)

**Emails not sending?**

- Check Val Town email quota
- Verify `recipient.email` is valid
- Check Val Town logs for errors

**Deduplication not working?**

- Check blob storage is writable in Val Town
- Verify state key isn't conflicting with old data
- Clear blob state if needed: `await blob.delete(ALERT_STATE_KEY)`

## Next Steps

Once this is working, consider:

- Customizing email HTML to your brand
- Adding more player context (fixtures, form, ownership)
- Supporting user preferences for notification window
- Adding SMS option for high-risk players

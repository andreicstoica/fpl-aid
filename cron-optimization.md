# Val Town Cron Integration Plan

## Current Flow

- Val Town cron polls `GET /api/alerts/fpl-ready` every 15 minutes to check for users ready to receive alerts.
- The API validates secret header, loads users from database, and checks if they're in their send window.
- For each recipient, we assess their squad's player risks (injury/suspension/doubtful/form dip) and return minimal player info.
- Val Town renders and sends personalized emails with player risk badges and news.

## Implementation

### Components

1. **`/api/alerts/fpl-ready` endpoint** (`src/routes/api/alerts/fpl-ready.ts`)
   - GET endpoint with secret auth
   - Query params: `gw` (optional), `now` (optional ISO), `windowHours` (optional, default 14)
   - Returns JSON with gameweek info, deadline, window, and recipients array
   - Each recipient includes userId, email, and players array with risk badges

2. **Player risk assessment** (`src/lib/fpl/playerRisk.ts`)
   - Evaluates FPL status flags: suspended, injured, doubtful
   - Checks news text for keywords
   - Assesses form dip using formDelta metric
   - Returns badge + news for each player

3. **Scheduling helpers** (`src/lib/alerts/scheduling.ts`)
   - `getCurrentWindow(now, deadline, hoursBefore)` - computes send window
   - `isInWindow(now, window)` - checks if timestamp falls in window
   - `computeUserSendWindow(recipient, deadline, defaultHours)` - user-specific window

4. **Val Town cron**
   - Polls endpoint every 12 hours
   - Renders HTML emails with player risk badges
   - Dedupes via Val Town blob storage (userId:gameweek key)
   - Sends via Val Town's email() function

### Environment Variables

App side:
- `ALERT_WEBHOOK_SHARED_SECRET` - shared secret for auth

Val Town side:
- `APP_ORIGIN` - your app URL
- `ALERT_WEBHOOK_SHARED_SECRET` - same secret as app

### Future Enhancements

1. **User notification preferences**
   - Store per-user window preferences in database
   - Customize send window (currently default 14h)
   - Opt-in/opt-out per user

2. **Rich email content**
   - Add fixture info
   - Show differential recommendations
   - Suggest swaps for injured players

3. **Analytics**
   - Track open rates
   - Monitor send success
   - Log recipient engagement

See `VALTOWN_INSTRUCTIONS.md` for complete migration guide.

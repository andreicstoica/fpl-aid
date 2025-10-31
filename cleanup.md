# Cleanup Plan

## 1. Loader & Query Duplication
- Problem: `src/routes/index.tsx` recalculates recommendations and refetches `/api/fpl-dashboard`, but the loader result is unused because `Dashboard` runs its own React Query call. Navigation causes duplicate API traffic and redundant recommendation work.
- Fix:
  - Either feed loader data into React Query cache during loader execution or consume loader output via `useLoaderData` in `Dashboard`.
  - Remove redundant fetching/calculation in the loader once data flow is unified.

## 2. Session DB Round-Trips
- Problem: `src/routes/api/fpl-dashboard.ts` and `src/routes/api/fpl-roster.ts` call `getUserFplData`, even though `auth.api.getSession` already hydrates `session.user` with the same IDs. That forces an extra DB read on every request.
- Fix:
  - Use the IDs exposed on `session.user` instead of re-querying.
  - Keep `getUserFplData` for other callers that lack session context.

## 3. Shared Player Transformations
- Problem: Player/roster helper logic is duplicated between dashboard and roster APIs.
- Fix:
  - Extract the shared helpers (team lookups, roster assembly, position/price conversions) into a shared module under `src/lib/fpl/`.
  - Reuse the shared functions in both endpoints (and the loader, if needed).

## 4. Recommendation Ranking Efficiency
- Problem: `src/lib/fpl/recommendations.ts` sorts the entire candidate pool, even though only the top `MAX_RECOMMENDATIONS` items are returned.
- Fix:
  - Replace the full `.sort().slice()` with a fixed-size selection strategy (e.g., bounded insertion or min-heap of size `MAX_RECOMMENDATIONS`).
  - Maintain filtering thresholds while minimizing total comparisons.


ALTER TABLE "user_team_data" ALTER COLUMN "id" SET DEFAULT '26e6edd1-29cb-4448-ba68-4adf7eb1ded3';--> statement-breakpoint
ALTER TABLE "user_team_data" ADD COLUMN "roster_cache" jsonb DEFAULT 'null'::jsonb;--> statement-breakpoint
ALTER TABLE "user_team_data" ADD COLUMN "roster_cache_updated_at" timestamp;
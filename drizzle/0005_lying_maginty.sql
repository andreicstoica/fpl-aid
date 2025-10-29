ALTER TABLE "user_team_data" ALTER COLUMN "id" SET DEFAULT 'c18db471-c8de-4616-a43c-0db72f74e17e';--> statement-breakpoint
ALTER TABLE "user_team_data" ADD COLUMN "dashboard_cache" jsonb DEFAULT 'null'::jsonb;--> statement-breakpoint
ALTER TABLE "user_team_data" ADD COLUMN "dashboard_cache_updated_at" timestamp;
CREATE TABLE "recommendations_cache" (
	"id" text PRIMARY KEY DEFAULT '3e2634a6-8335-484f-aa79-8e1ac040045c' NOT NULL,
	"user_id" text NOT NULL,
	"league_id" text,
	"gameweek" integer NOT NULL,
	"context_hash" text NOT NULL,
	"payload" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	CONSTRAINT "recommendations_cache_unique" UNIQUE("user_id","league_id","gameweek","context_hash")
);
--> statement-breakpoint
ALTER TABLE "user_team_data" ALTER COLUMN "id" SET DEFAULT '1dcb3e62-6946-4dd0-a8d6-4dc8018eb6f1';--> statement-breakpoint
CREATE INDEX "recommendations_cache_user_idx" ON "recommendations_cache" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "recommendations_cache_league_idx" ON "recommendations_cache" USING btree ("league_id");--> statement-breakpoint
CREATE INDEX "recommendations_cache_gw_idx" ON "recommendations_cache" USING btree ("gameweek");--> statement-breakpoint
CREATE INDEX "recommendations_cache_ctx_idx" ON "recommendations_cache" USING btree ("context_hash");--> statement-breakpoint
CREATE INDEX "recommendations_cache_expires_idx" ON "recommendations_cache" USING btree ("expires_at");
CREATE TABLE "user_team_data" (
	"id" text PRIMARY KEY DEFAULT '404c161e-2f13-497a-89f6-d16ab20ab7c1' NOT NULL,
	"user_id" text NOT NULL,
	"fpl_team_id" text NOT NULL,
	"fpl_league_id" text NOT NULL,
	"favorite_team" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_team_data" ADD CONSTRAINT "user_team_data_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "fpl_team_id";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "fpl_league_id";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "favorite_team";
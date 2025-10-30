import { boolean, integer, jsonb, pgTable, text, timestamp, index, unique } from "drizzle-orm/pg-core";
import type { FplDashboardData, FplRosterPlayer } from "@/types/fpl";

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text("image"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const userTeamData = pgTable("user_team_data", {
	id: text("id").primaryKey().default(crypto.randomUUID()),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	fplTeamId: text("fpl_team_id").notNull(),
	fplLeagueId: text("fpl_league_id").notNull(),
	favoriteTeam: text("favorite_team").notNull(),
	rosterCache: jsonb("roster_cache")
		.$type<FplRosterPlayer[] | null>()
		.default(null),
	rosterCacheUpdatedAt: timestamp("roster_cache_updated_at"),
	dashboardCache: jsonb("dashboard_cache")
		.$type<FplDashboardData | null>()
		.default(null),
	dashboardCacheUpdatedAt: timestamp("dashboard_cache_updated_at"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

// Cache of differential recommendations computed server-side
export const recommendationsCache = pgTable(
	"recommendations_cache",
	{
		id: text("id").primaryKey().default(crypto.randomUUID()),
		userId: text("user_id").notNull(),
		leagueId: text("league_id"),
		gameweek: integer("gameweek").notNull(),
		contextHash: text("context_hash").notNull(),
		payload: jsonb("payload").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		expiresAt: timestamp("expires_at").notNull(),
	},
	(table) => {
		return {
			userIdx: index("recommendations_cache_user_idx").on(table.userId),
			leagueIdx: index("recommendations_cache_league_idx").on(table.leagueId),
			gwIdx: index("recommendations_cache_gw_idx").on(table.gameweek),
			ctxIdx: index("recommendations_cache_ctx_idx").on(table.contextHash),
			expIdx: index("recommendations_cache_expires_idx").on(table.expiresAt),
			uniq: unique("recommendations_cache_unique").on(
				table.userId,
				table.leagueId,
				table.gameweek,
				table.contextHash,
			),
		};
	},
);

import { describe, expect, it } from "vitest";
import {
	type SignUpFormData,
	validateEmail,
	validatePassword,
	validateSignUpForm,
} from "./form-utils";

describe("form-utils", () => {
	it("validates email format", () => {
		expect(validateEmail("")).toMatch(/required/);
		expect(validateEmail("x@y")).toMatch(/valid/);
		expect(validateEmail("user@example.com")).toBeUndefined();
	});

	it("validates password min length when provided", () => {
		expect(validatePassword("", 6)).toMatch(/required/);
		expect(validatePassword("12345", 6)).toMatch(/at least 6/);
		expect(validatePassword("123456", 6)).toBeUndefined();
	});

	it("validates full sign-up form", () => {
		const bad: SignUpFormData = {
			name: "",
			email: "bad",
			password: "123",
			fplTeamId: "abc",
			fplLeagueId: "",
			favoriteTeam: "",
		};
		const errs = validateSignUpForm(bad);
		expect(Object.keys(errs).length).toBeGreaterThan(0);

		const good: SignUpFormData = {
			name: "A",
			email: "a@b.com",
			password: "123456",
			fplTeamId: "123",
			fplLeagueId: "456",
			favoriteTeam: "ARS",
		};
		const ok = validateSignUpForm(good);
		expect(Object.keys(ok).length).toBe(0);
	});
});

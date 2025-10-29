// Form validation utilities
export type ValidationErrors<T> = Partial<Record<keyof T, string>>;

export interface BaseFormData {
	email: string;
	password: string;
}

export interface SignUpFormData extends BaseFormData {
	name: string;
	fplTeamId: string;
	fplLeagueId: string;
	favoriteTeam: string;
}

export interface SignInFormData extends BaseFormData {}

// Email validation
export const validateEmail = (email: string): string | undefined => {
	if (!email.trim()) {
		return "Email is required";
	}
	if (!/\S+@\S+\.\S+/.test(email)) {
		return "Please enter a valid email";
	}
	return undefined;
};

// Password validation with optional minimum length
export const validatePassword = (
	password: string,
	minLength: number = 0,
): string | undefined => {
	if (!password.trim()) {
		return "Password is required";
	}
	if (minLength > 0 && password.length < minLength) {
		return `Password must be at least ${minLength} characters`;
	}
	return undefined;
};

// Name validation
export const validateName = (name: string): string | undefined => {
	if (!name.trim()) {
		return "Full name is required";
	}
	return undefined;
};

// FPL ID validation (numeric)
export const validateFplId = (
	id: string,
	fieldName: string,
): string | undefined => {
	if (!id.trim()) {
		return `${fieldName} is required`;
	}
	if (!/^\d+$/.test(id)) {
		return `${fieldName} must be a number`;
	}
	return undefined;
};

// Required field validation
export const validateRequired = (
	value: string,
	fieldName: string,
): string | undefined => {
	if (!value.trim()) {
		return `${fieldName} is required`;
	}
	return undefined;
};

// SignUp form validation
export const validateSignUpForm = (
	formData: SignUpFormData,
): ValidationErrors<SignUpFormData> => {
	const errors: ValidationErrors<SignUpFormData> = {};

	const nameError = validateName(formData.name);
	if (nameError) errors.name = nameError;

	const emailError = validateEmail(formData.email);
	if (emailError) errors.email = emailError;

	const passwordError = validatePassword(formData.password, 6);
	if (passwordError) errors.password = passwordError;

	const fplTeamIdError = validateFplId(formData.fplTeamId, "FPL Team ID");
	if (fplTeamIdError) errors.fplTeamId = fplTeamIdError;

	const fplLeagueIdError = validateFplId(formData.fplLeagueId, "FPL League ID");
	if (fplLeagueIdError) errors.fplLeagueId = fplLeagueIdError;

	const favoriteTeamError = validateRequired(
		formData.favoriteTeam,
		"Favorite team",
	);
	if (favoriteTeamError) errors.favoriteTeam = favoriteTeamError;

	return errors;
};

// SignIn form validation
export const validateSignInForm = (
	formData: SignInFormData,
): ValidationErrors<SignInFormData> => {
	const errors: ValidationErrors<SignInFormData> = {};

	const emailError = validateEmail(formData.email);
	if (emailError) errors.email = emailError;

	const passwordError = validatePassword(formData.password);
	if (passwordError) errors.password = passwordError;

	return errors;
};

// Individual field validation for blur events
export const validateSignUpField = (
	field: keyof SignUpFormData,
	value: string,
	currentErrors: ValidationErrors<SignUpFormData>,
): ValidationErrors<SignUpFormData> => {
	const newErrors = { ...currentErrors };

	switch (field) {
		case "name": {
			const nameError = validateName(value);
			if (nameError) {
				newErrors.name = nameError;
			} else {
				delete newErrors.name;
			}
			break;
		}

		case "email": {
			const emailError = validateEmail(value);
			if (emailError) {
				newErrors.email = emailError;
			} else {
				delete newErrors.email;
			}
			break;
		}

		case "password": {
			const passwordError = validatePassword(value, 6);
			if (passwordError) {
				newErrors.password = passwordError;
			} else {
				delete newErrors.password;
			}
			break;
		}

		case "fplTeamId": {
			const fplTeamIdError = validateFplId(value, "FPL Team ID");
			if (fplTeamIdError) {
				newErrors.fplTeamId = fplTeamIdError;
			} else {
				delete newErrors.fplTeamId;
			}
			break;
		}

		case "fplLeagueId": {
			const fplLeagueIdError = validateFplId(value, "FPL League ID");
			if (fplLeagueIdError) {
				newErrors.fplLeagueId = fplLeagueIdError;
			} else {
				delete newErrors.fplLeagueId;
			}
			break;
		}

		case "favoriteTeam": {
			const favoriteTeamError = validateRequired(value, "Favorite team");
			if (favoriteTeamError) {
				newErrors.favoriteTeam = favoriteTeamError;
			} else {
				delete newErrors.favoriteTeam;
			}
			break;
		}
	}

	return newErrors;
};

// Individual field validation for SignIn blur events
export const validateSignInField = (
	field: keyof SignInFormData,
	value: string,
	currentErrors: ValidationErrors<SignInFormData>,
): ValidationErrors<SignInFormData> => {
	const newErrors = { ...currentErrors };

	switch (field) {
		case "email": {
			const emailError = validateEmail(value);
			if (emailError) {
				newErrors.email = emailError;
			} else {
				delete newErrors.email;
			}
			break;
		}

		case "password": {
			const passwordError = validatePassword(value);
			if (passwordError) {
				newErrors.password = passwordError;
			} else {
				delete newErrors.password;
			}
			break;
		}
	}

	return newErrors;
};

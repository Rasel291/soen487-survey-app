import { SurveyAccessValidator, ValidationError } from './surveyAccessValidator';

export class ResponseValidator {
	validatePayload(token: string | undefined, answers: unknown): ValidationError | null {
		if (!token) {
			return { status: 400, message: 'Survey token is required' };
		}

		if (!answers || typeof answers !== 'object') {
			return { status: 400, message: 'Invalid answers format' };
		}

		return null;
	}

	validateSurveyAccess(surveyData: FirebaseFirestore.DocumentData | undefined, token: string): ValidationError | null {
		const surveyValidator = new SurveyAccessValidator();
		return surveyValidator.validate(surveyData, token);
	}

	validateSubmissionUniqueness(hasSubmission: boolean): ValidationError | null {
		if (hasSubmission) {
			return { status: 409, message: 'This survey link has already been used' };
		}
		return null;
	}
}

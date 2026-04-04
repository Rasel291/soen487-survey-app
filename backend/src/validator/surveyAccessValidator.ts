import { isExpiredSurvey } from "../controllers/surveyController";

export interface ValidationError {
    status: number;
    message: string;
}

export class SurveyAccessValidator {
    validate(surveyData: FirebaseFirestore.DocumentData | undefined, token: string): ValidationError | null {
        if (!surveyData) {
            return { status: 404, message: 'Survey not found' };
        }

        if (!surveyData.published) {
            return { status: 403, message: 'This survey is not currently available' };
        }

        if (!surveyData.publicLinkToken || surveyData.publicLinkToken !== token) {
            return { status: 403, message: 'Invalid survey link token' };
        }

        if (isExpiredSurvey(surveyData.expiryDate)) {
            return { status: 410, message: 'This survey has expired' };
        }

        return null;
    }
}
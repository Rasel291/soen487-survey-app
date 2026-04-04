import { formatSurvey } from '../controllers/surveyController';
import { AppError, NotFoundError } from '../errors/appError';
import { db } from '../services/firebase';
import { SurveyAccessValidator } from '../validator/surveyAccessValidator';

export class SurveyService {
    static async getPublicSurvey(surveyId: string, token: string) {
        const doc = await db.collection('surveys').doc(surveyId).get();
        if (!doc.exists)
            throw new NotFoundError('Survey not found');

        const validator = new SurveyAccessValidator();
        const payloadError = validator.validate(doc.data(), token);
        if (payloadError)
            throw new AppError(payloadError.message, payloadError.status);

        const existing =
            await db.collection('responses')
                .where('surveyId', '==', surveyId)
                .where('accessToken', '==', token)
                .limit(1).get();

        if (!existing.empty)
            throw new AppError('This survey link has already been used', 409);

        return formatSurvey(doc);
    }
}
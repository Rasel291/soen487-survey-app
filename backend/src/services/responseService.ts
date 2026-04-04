import { AppError, NotFoundError } from '../errors/appError';
import { db, admin } from './firebase';
import { ResponseValidator } from '../validator/responseValidator';

export class ResponseService {
	static async submitPublicResponse(surveyId: string, token: string | undefined, answers: unknown) {
		const validator = new ResponseValidator();

		const payloadError = validator.validatePayload(token, answers);
		if (payloadError) {
			throw new AppError(payloadError.message, payloadError.status);
		}

		const safeToken = token as string;
		const surveyDoc = await db.collection('surveys').doc(surveyId).get();

		if (!surveyDoc.exists) {
			throw new NotFoundError('Survey not found');
		}

		const accessError = validator.validateSurveyAccess(surveyDoc.data(), safeToken);
		if (accessError) {
			throw new AppError(accessError.message, accessError.status);
		}

		const existingSubmission =
            await db.collection('responses')
			    .where('surveyId', '==', surveyId)
			    .where('accessToken', '==', safeToken)
			    .limit(1)
			    .get();

		const uniquenessError = validator.validateSubmissionUniqueness(!existingSubmission.empty);
		if (uniquenessError) {
			throw new AppError(uniquenessError.message, uniquenessError.status);
		}

		await db.collection('responses').add({
			surveyId,
			answers,
			accessToken: safeToken,
			submittedAt: admin.firestore.FieldValue.serverTimestamp(),
		});
	}
}

import { Request, Response } from "express";
import { db, admin } from "../services/firebase";

export const isExpiredSurvey = (expiryDate: any) => {
    if (!expiryDate || typeof expiryDate.toDate !== 'function') {
        return false;
    }
    return expiryDate.toDate() < new Date();
};

export const submitPublicResponse = async (req: Request, res: Response) => {
    try {
        const surveyId = req.params.id as string;
        const token = (req.query.token as string | undefined)?.trim();
        const { answers } = req.body;

        if (!token) {
            return res.status(400).json({ error: 'Survey token is required' });
        }

        if (!answers || typeof answers !== 'object') {
            return res.status(400).json({ error: 'Invalid answers format' });
        }

        const surveyRef = db.collection('surveys').doc(surveyId);
        const surveyDoc = await surveyRef.get();

        if (!surveyDoc.exists) {
            return res.status(404).json({ error: 'Survey not found' });
        }

        const surveyData = surveyDoc.data();
        if (!surveyData) {
            return res.status(404).json({ error: 'Survey not found' });
        }

        if (!surveyData.published) {
            return res.status(403).json({ error: 'This survey is not currently available' });
        }

        if (!surveyData.publicLinkToken || surveyData.publicLinkToken !== token) {
            return res.status(403).json({ error: 'Invalid survey link token' });
        }

        if (isExpiredSurvey(surveyData.expiryDate)) {
            return res.status(410).json({ error: 'This survey has expired' });
        }

        const existingSubmission = 
            await db.collection('responses')
                .where('surveyId', '==', surveyId)
                .where('accessToken', '==', token)
                .limit(1)
                .get();

        if (!existingSubmission.empty) {
            return res.status(409).json({ error: 'This survey link has already been used' });
        }

        await db.collection('responses').add({
            surveyId,
            answers,
            accessToken: token,
            submittedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        res.status(200).json({ message: 'Response submitted successfully' });
    } catch (error) {
        console.error('Error submitting public response:', error);
        res.status(500).json({ error: 'Failed to submit response' });
    }
};
import { Request, Response } from "express";
import { AppError } from "../errors/appError";
import { ResponseService } from "../services/responseService";
import { db } from '../services/firebase';

export const submitPublicResponse = async (req: Request, res: Response) => {
    try {
        const surveyId = req.params.id as string;
        const token = (req.query.token as string | undefined)?.trim();
        const { answers } = req.body;

        await ResponseService.submitPublicResponse(surveyId, token, answers);

        res.status(200).json({ message: 'Response submitted successfully' });
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.status).json({ error: error.message });
        }

        res.status(500).json({ error: 'Failed to submit response' });
    }
};

export const getSurveyResponses = async (req: Request, res: Response) => {
    try {
        const surveyId = req.params.id as string;

        const surveyDoc = await db.collection('surveys').doc(surveyId).get();
        if (!surveyDoc.exists) {
            return res.status(404).json({ error: 'Survey not found' });
        }
        const snapshot = await db.collection('responses')
            .where('surveyId', '==', surveyId)
            .get();

        const responses = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                surveyId: data.surveyId,
                answers: data.answers || {},
                accessToken: data.accessToken,
                submittedAt: data.submittedAt,
            };
        });
        res.json(responses);
    } catch (error) {
        console.error('Error fetching responses:', error); 
        res.status(500).json({ error: 'Failed to fetch analytics data' });
    }
};
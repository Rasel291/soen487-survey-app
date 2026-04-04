import { Request, Response } from 'express';
import { db, admin } from '../services/firebase';
import { Survey } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { SurveyService } from '../services/surveyService';

// Helper: Convert YYYY-MM-DD string 
const toUTCTimestamp = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return admin.firestore.Timestamp.fromDate(date);
};

// Helper: Convert Firestore document to a JSON-friendly object
export const formatSurvey = (doc: admin.firestore.DocumentSnapshot): Survey | null => {
    const data = doc.data();
    if (!data) return null;
    const expiryDate = data.expiryDate ? data.expiryDate.toDate() : null;
    return {
        id: doc.id,
        title: data.title,
        description: data.description,
        expiryDate: expiryDate ? expiryDate.toISOString() : null,
        published: data.published,
        publicLinkToken: data.publicLinkToken || null,
        createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null,
        createdBy: data.createdBy,
        questions: data.questions || [],
        isExpired: expiryDate ? expiryDate < new Date() : false,
    };
};

const formatQuestions = (questions: any[]) => {
    return questions.map(q => {
        const clean: any = {
            id: q.id,
            text: q.text,
            type: q.type,
            required: q.required,
        };

        if (q.options !== undefined) clean.options = q.options;
        if (q.scaleMin !== undefined) clean.scaleMin = q.scaleMin;
        if (q.scaleMax !== undefined) clean.scaleMax = q.scaleMax;

        return clean;
    });
};

export const isExpiredSurvey = (expiryDate: any) => {
    if (!expiryDate || typeof expiryDate.toDate !== 'function') {
        return false;
    }
    return expiryDate.toDate() < new Date();
};

// GET /api/surveys
export const getSurveys = async (req: Request, res: Response) => {
    try {
        const snapshot = await db.collection('surveys')
            .orderBy('createdAt', 'desc')
            .get();
        const surveys = snapshot.docs.map(doc => formatSurvey(doc));
        res.json(surveys);
    } catch (error) {
        console.error('Error fetching surveys:', error);
        res.status(500).json({ error: 'Failed to fetch surveys' });
    }
};

// GET /api/surveys/:id
export const getSurveyById = async (req: Request, res: Response) => {
    try {
        const surveyId = req.params.id as string;
        const doc = await db.collection('surveys').doc(surveyId).get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Survey not found' });
        }
        res.json(formatSurvey(doc));
    } catch (error) {
        console.error('Error fetching survey:', error);
        res.status(500).json({ error: 'Failed to fetch survey' });
    }
};

export const getPublicSurveyByToken = async (req: Request, res: Response) => {
    const token = (req.query.token as string | undefined)?.trim();
    const surveyId = req.params.id as string;
    if (!token)
        return res.status(400).json({ error: 'Survey token is required' });

    const survey = await SurveyService.getPublicSurvey(surveyId, token);
    res.json(survey);
};

// POST /api/surveys
export const createSurvey = async (req: Request, res: Response) => {
    try {
        const { title, description, expiryDate, questions } = req.body;
        if (!title || !description || !expiryDate) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const expiryTimestamp = toUTCTimestamp(expiryDate);
        const cleanQuestions = formatQuestions(questions || []);

        const newSurvey = {
            title: title.trim(),
            description: description.trim(),
            expiryDate: expiryTimestamp,
            published: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: (req as any).user.uid,
            questions: cleanQuestions,
        };

        const docRef = await db.collection('surveys').add(newSurvey);

        const createdData = {
            id: docRef.id,
            title: newSurvey.title,
            description: newSurvey.description,
            expiryDate: new Date(expiryTimestamp.toDate()).toISOString(),
            published: newSurvey.published,
            createdAt: new Date().toISOString(),
            createdBy: newSurvey.createdBy,
            questions: newSurvey.questions,
        };
        res.status(201).json(createdData);
    } catch (error) {
        console.error('Error creating survey:', error);
        res.status(500).json({ error: 'Failed to create survey' });
    }
};

// PUT /api/surveys/:id
export const updateSurvey = async (req: Request, res: Response) => {
    try {
        const surveyId = req.params.id as string;
        const { title, description, expiryDate, questions } = req.body;
        const surveyRef = db.collection('surveys').doc(surveyId);
        const doc = await surveyRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Survey not found' });
        }

        const updates: any = {};
        if (title !== undefined) updates.title = title.trim();
        if (description !== undefined) updates.description = description.trim();
        if (expiryDate !== undefined) {
            updates.expiryDate = toUTCTimestamp(expiryDate);
        }
        if (questions !== undefined) {
            updates.questions = formatQuestions(questions);
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }
        await surveyRef.update(updates);
        res.json({ message: 'Survey updated successfully' });
    } catch (error) {
        console.error('Error updating survey:', error);
        res.status(500).json({ error: 'Failed to update survey' });
    }
};

// DELETE /api/surveys/:id
export const deleteSurvey = async (req: Request, res: Response) => {
    try {
        const surveyId = req.params.id as string;
        const surveyRef = db.collection('surveys').doc(surveyId);
        const doc = await surveyRef.get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Survey not found' });
        }
        await surveyRef.delete();
        res.json({ message: 'Survey deleted successfully' });
    } catch (error) {
        console.error('Error deleting survey:', error);
        res.status(500).json({ error: 'Failed to delete survey' });
    }
};

// POST /api/surveys/:id/publish
export const publishSurvey = async (req: Request, res: Response) => {
    try {
        const surveyId = req.params.id as string;
        const surveyRef = db.collection('surveys').doc(surveyId);
        const doc = await surveyRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Survey not found' });
        }

        const surveyData = doc.data();
        if (!surveyData) {
            return res.status(404).json({ error: 'Survey not found' });
        }

        // Check expiry
        const expiryDate = surveyData.expiryDate;
        if (expiryDate && expiryDate.toDate() < new Date()) {
            return res.status(400).json({ error: 'Cannot publish a survey that has already expired' });
        }

        if (surveyData.published) {
            return res.status(400).json({ error: 'Survey is already published' });
        }

        const token = uuidv4();
        await surveyRef.update({
            published: true,
            publicLinkToken: token,
        });

        const link = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/surveys/${surveyId}?token=${token}`;
        res.json({ message: 'Survey published', link });
    } catch (error) {
        console.error('Error publishing survey:', error);
        res.status(500).json({ error: 'Failed to publish survey' });
    }
};

// POST /api/surveys/:id/close
export const closeSurvey = async (req: Request, res: Response) => {
    try {
        const surveyId = req.params.id as string;
        const surveyRef = db.collection('surveys').doc(surveyId);
        const doc = await surveyRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Survey not found' });
        }

        const surveyData = doc.data();
        if (!surveyData) {
            return res.status(404).json({ error: 'Survey not found' });
        }

        if (!surveyData.published) {
            return res.status(400).json({ error: 'Survey is already closed' });
        }

        await surveyRef.update({ published: false });
        res.json({ message: 'Survey closed' });
    } catch (error) {
        console.error('Error closing survey:', error);
        res.status(500).json({ error: 'Failed to close survey' });
    }
};
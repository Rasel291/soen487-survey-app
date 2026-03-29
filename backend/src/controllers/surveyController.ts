import { Request, Response } from 'express';
import { db, admin } from '../services/firebase';
import { Survey } from '../types';

// Helper: Convert YYYY-MM-DD string 
const toUTCTimestamp = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return admin.firestore.Timestamp.fromDate(date);
};

// Helper: Convert Firestore document to a JSON-friendly object
const formatSurvey = (doc: admin.firestore.DocumentSnapshot): Survey | null => {
    const data = doc.data();
    if (!data) return null;
    return {
        id: doc.id,
        title: data.title,
        description: data.description,
        expiryDate: data.expiryDate ? data.expiryDate.toDate().toISOString() : null,
        published: data.published,
        createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null,
        createdBy: data.createdBy,
    };
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

// POST /api/surveys
export const createSurvey = async (req: Request, res: Response) => {
    try {
        const { title, description, expiryDate } = req.body;
        if (!title || !description || !expiryDate) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const expiryTimestamp = toUTCTimestamp(expiryDate);

        const newSurvey = {
            title: title.trim(),
            description: description.trim(),
            expiryDate: expiryTimestamp,
            published: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: (req as any).user.uid,
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
        const { title, description, expiryDate } = req.body;
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
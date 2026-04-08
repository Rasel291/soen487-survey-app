import { Request, Response } from 'express';
import { ParticipantService } from '../services/participantService';

export const uploadParticipants = async (req: Request, res: Response) => {
	try {
		const surveyId = req.params.id as string;
		const { emails } = req.body;

		const result = await ParticipantService.upload(surveyId, emails);
		res.status(201).json(result);
	} catch (e: any) {
		console.error('Error uploading participants:', e);
		res.status(e.status || 500).json({
			error: e.message || 'Failed to upload participants',
		});
	}
};

export const sendInvites = async (req: Request, res: Response) => {
	try {
		const surveyId = req.params.id as string;

		const result = await ParticipantService.sendInvites(surveyId);
		res.json(result);
	} catch (e: any) {
		console.error('Error sending invites:', e);
		res.status(e.status || 500).json({
			error: e.message || 'Failed to send invitations',
		});
	}
};

export const listParticipants = async (req: Request, res: Response) => {
	try {
		const surveyId = req.params.id as string;
		const participants = await ParticipantService.listBySurvey(surveyId);
		res.json(participants);
	} catch (e: any) {
		console.error('Error fetching participants:', e);
		res.status(e.status || 500).json({
			error: e.message || 'Failed to fetch participants',
		});
	}
};
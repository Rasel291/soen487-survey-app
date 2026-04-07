import { db, admin } from './firebase';
import { AppError, NotFoundError } from '../errors/appError';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

export class ParticipantService {
	static isValidEmail(email: string) {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
	}

    static async listBySurvey(surveyId: string) {
        const survey = await db.collection('surveys').doc(surveyId).get();
        if (!survey.exists) {
            throw new NotFoundError('Survey not found');
        }

        const snapshot = await db
            .collection('participants')
            .where('surveyId', '==', surveyId)
            .get();

        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
    }

	static async upload(surveyId: string, emails: string[]) {
		if (!Array.isArray(emails)) {
			throw new AppError('Emails must be an array', 400);
		}

		const survey = await db.collection('surveys').doc(surveyId).get();
		if (!survey.exists) {
			throw new NotFoundError('Survey not found');
		}

		const valid: string[] = [];
		const invalid: string[] = [];

		emails.forEach((e) => {
			const email = String(e).trim().toLowerCase();
			if (!email) return;

			if (this.isValidEmail(email)) {
				valid.push(email);
			} else {
				invalid.push(email);
			}
		});

		const uniqueValid = [...new Set(valid)];

		for (const email of uniqueValid) {
			await db.collection('participants').add({
				surveyId,
				email,
				accessToken: crypto.randomUUID(),
				invitedAt: null,
			});
		}

		return {
			uploaded: uniqueValid.length,
			invalid,
		};
	}

	static async sendInvites(surveyId: string) {
		const surveyDoc = await db.collection('surveys').doc(surveyId).get();
		if (!surveyDoc.exists) {
			throw new NotFoundError('Survey not found');
		}

		const survey = surveyDoc.data();
		if (!survey) {
			throw new NotFoundError('Survey not found');
		}

		const participants = await db
			.collection('participants')
			.where('surveyId', '==', surveyId)
			.get();

		if (participants.empty) {
			throw new AppError('No participants', 400);
		}

		const transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASS,
			},
		});

		const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';
		const expiry = survey.expiryDate.toDate().toLocaleDateString();

		for (const doc of participants.docs) {
			const p = doc.data();

			const link = `${frontend}/surveys/${surveyId}?token=${p.accessToken}`;

			await transporter.sendMail({
				from: process.env.EMAIL_USER,
				to: p.email,
				subject: `Survey: ${survey.title}`,
				text: `
                You are invited to participate in a survey.

                Title: ${survey.title}
                Expiry Date: ${expiry}

                Access the survey here:
                ${link}
				`,
				html: `
					<h2>Survey Invitation</h2>
					<p>You are invited to participate in a survey.</p>
					<p><strong>Title:</strong> ${survey.title}</p>
					<p><strong>Expiry Date:</strong> ${expiry}</p>
					<p><a href="${link}">Open Survey</a></p>
				`,
			});

			await doc.ref.update({
				invitedAt: admin.firestore.FieldValue.serverTimestamp(),
			});
		}

		return { sent: participants.size };
	}
}
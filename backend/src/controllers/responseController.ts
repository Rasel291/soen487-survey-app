import { Request, Response } from "express";
import { AppError } from "../errors/appError";
import { ResponseService } from "../services/responseService";

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
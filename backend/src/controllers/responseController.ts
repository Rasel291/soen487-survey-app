import { Request, Response } from "express";

export const sumbitResponse = async (req: Request, res: Response) => {
    try {
        const surveyId = req.params.id as string;
        const { answers } = req.body;

    
        if (!answers || typeof answers !== 'object') {
            return res.status(400).json({ error: 'Invalid answers format' });
        }

        const responseData = {
            surveyId,
            answers,
            submitedAt: new Date().toISOString(),
            submittedBy: (req as any).user.uid,
        };
        console.log("Received response data:", responseData);
        res.status(200).json({ message: "Response submitted successfully" });
    } catch (error) {
        res.status(500).json({ error: 'Failed to submit response' });
    }
}
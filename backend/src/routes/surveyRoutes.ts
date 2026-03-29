import { Router } from 'express';
import { verifyToken } from '../middleware/auth';
import {
    getSurveys,
    getSurveyById,
    createSurvey,
    updateSurvey,
    deleteSurvey,
} from '../controllers/surveyController';

const router = Router();

router.get('/', verifyToken, getSurveys);
router.get('/:id', verifyToken, getSurveyById);
router.post('/', verifyToken, createSurvey);
router.put('/:id', verifyToken, updateSurvey);
router.delete('/:id', verifyToken, deleteSurvey);

export default router;
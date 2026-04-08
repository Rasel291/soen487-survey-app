import { Router } from 'express';
import {
	uploadParticipants,
	sendInvites,
	listParticipants,
} from '../controllers/participantController';
import { verifyToken } from '../middleware/auth';

const router = Router();

router.get('/:id', verifyToken, listParticipants);
router.post('/:id/upload', verifyToken, uploadParticipants);
router.post('/:id/send', verifyToken, sendInvites);

export default router;
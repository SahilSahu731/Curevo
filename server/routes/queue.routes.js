import express from 'express';
import { getQueuePositionForPatient, getTodayQueueForDoctor, joinQueue, updateQueueStatus } from '../controllers/queue.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/join', authorize('patient', 'admin'), joinQueue);
router.patch('/update', authorize('doctor', 'admin'), updateQueueStatus);
router.get('/position/:appointmentId', getQueuePositionForPatient);
// Only doctors/admins should see the full queue details
router.get('/doctor/:doctorId', authorize('doctor', 'admin'), getTodayQueueForDoctor);
router.get('/:doctorId', authorize('doctor', 'admin'), getTodayQueueForDoctor);

export default router;

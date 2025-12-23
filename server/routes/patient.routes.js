import express from 'express';
import { bookAppointment, getMyAppointments, checkIn, cancelAppointment } from '../controllers/patient.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/appointment', bookAppointment);
router.get('/appointments', getMyAppointments);
router.post('/appointment/:id/check-in', checkIn);
router.delete('/appointment/:id', cancelAppointment);

export default router;

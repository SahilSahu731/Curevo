import express from 'express';
import { bookAppointment, getMyAppointments, checkIn, cancelAppointment } from '../controllers/patient.controller.js';
import { authorize, protect, requireVerifiedEmail } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { appointmentSchemas } from '../validations/schemas.js';

const router = express.Router();

router.use(protect);

router.post('/appointment', authorize('patient', 'admin'), requireVerifiedEmail, validate(appointmentSchemas.create), bookAppointment);
router.get('/appointments', getMyAppointments);
router.post('/appointment/:id/check-in', authorize('patient', 'admin'), requireVerifiedEmail, checkIn);
router.delete('/appointment/:id', authorize('patient', 'admin'), requireVerifiedEmail, cancelAppointment);

export default router;

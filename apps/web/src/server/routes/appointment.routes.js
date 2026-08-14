import express from 'express';
import {
  createAppointment,
  deleteAppointment,
  getAppointment,
  getAppointments,
  getTelehealthAccessByRoom,
  getTelehealthSession,
  updateAppointment,
  rescheduleAppointment,
} from '../controllers/appointment.controller.js';
import { protect, authorize, requireVerifiedEmail } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { appointmentSchemas } from '../validations/schemas.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(requireVerifiedEmail, getAppointments)
  .post(authorize('patient', 'admin'), requireVerifiedEmail, validate(appointmentSchemas.create), createAppointment);

router.get('/:id/telehealth', requireVerifiedEmail, getTelehealthSession);
router.post('/:id/reschedule', authorize('patient', 'admin'), requireVerifiedEmail, validate(appointmentSchemas.reschedule), rescheduleAppointment);
router.get('/telehealth/rooms/:roomId/access', requireVerifiedEmail, getTelehealthAccessByRoom);

router.route('/:id')
  .get(requireVerifiedEmail, getAppointment)
  .put(requireVerifiedEmail, updateAppointment)
  .delete(requireVerifiedEmail, deleteAppointment);

export default router;

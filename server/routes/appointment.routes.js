import express from 'express';
import {
  createAppointment,
  deleteAppointment,
  getAppointment,
  getAppointments,
  getTelehealthSession,
  updateAppointment,
} from '../controllers/appointment.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { appointmentSchemas } from '../validations/schemas.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAppointments)
  .post(authorize('patient', 'admin'), validate(appointmentSchemas.create), createAppointment);

router.get('/:id/telehealth', getTelehealthSession);

router.route('/:id')
  .get(getAppointment)
  .put(updateAppointment)
  .delete(deleteAppointment);

export default router;

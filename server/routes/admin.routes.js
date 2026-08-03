import express from 'express';
import { 
    getDashboardStats, 
    getAllUsers, 
    updateUser, 
    deleteUser, 
    getUserAppointments,
    getAllAppointments,
    getDoctorVerifications,
    reviewDoctorVerification,
    downloadDoctorLicense
} from '../controllers/admin.controller.js';
import { getAllFeedback, updateFeedback } from '../controllers/feedback.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { feedbackSchemas, verificationSchemas } from '../validations/schemas.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/users/:id/appointments', getUserAppointments);
router.get('/appointments', getAllAppointments);
router.get('/doctor-verifications', getDoctorVerifications);
router.get('/doctor-verifications/:id/license', downloadDoctorLicense);
router.patch('/doctor-verifications/:id', validate(verificationSchemas.review), reviewDoctorVerification);
router.get('/feedback', getAllFeedback);
router.patch('/feedback/:id', validate(feedbackSchemas.update), updateFeedback);

export default router;

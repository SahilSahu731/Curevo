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
import { getSupportTickets, updateSupportTicket } from '../controllers/support.controller.js';
import { protect, authorize, authorizeAdminScope, requireRecentMfa } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { adminSchemas, feedbackSchemas, supportSchemas, verificationSchemas } from '../validations/schemas.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/users', authorizeAdminScope('operations', 'compliance', 'super-admin'), validate(adminSchemas.users), getAllUsers);
router.put('/users/:id', authorizeAdminScope('super-admin'), requireRecentMfa, validate(adminSchemas.userUpdate), updateUser);
router.delete('/users/:id', authorizeAdminScope('super-admin'), requireRecentMfa, validate(adminSchemas.userDeactivate), deleteUser);
router.get('/users/:id/appointments', authorizeAdminScope('compliance', 'super-admin'), getUserAppointments);
router.get('/appointments', authorizeAdminScope('operations', 'compliance', 'super-admin'), getAllAppointments);
router.get('/doctor-verifications', authorizeAdminScope('operations', 'super-admin'), getDoctorVerifications);
router.get('/doctor-verifications/:id/license', authorizeAdminScope('compliance', 'super-admin'), downloadDoctorLicense);
router.patch('/doctor-verifications/:id', authorizeAdminScope('super-admin'), requireRecentMfa, validate(verificationSchemas.review), reviewDoctorVerification);
router.get('/feedback', authorizeAdminScope('operations', 'super-admin'), getAllFeedback);
router.patch('/feedback/:id', authorizeAdminScope('operations', 'super-admin'), validate(feedbackSchemas.update), updateFeedback);
router.get('/support-tickets', authorizeAdminScope('operations', 'super-admin'), validate(supportSchemas.list), getSupportTickets);
router.patch('/support-tickets/:id', authorizeAdminScope('operations', 'super-admin'), validate(supportSchemas.update), updateSupportTicket);

export default router;

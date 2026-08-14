import express from 'express';
import { 
    createDoctor, 
    getDoctors, 
    getDoctor, 
    updateDoctorProfile, 
    submitVerification,
    getMyVerification,
    toggleAvailability,
    callNextPatient,
    completeConsultation,
    markPatientAbsent,
    getAvailability,
    updateAvailability,
    deleteDoctor,
    updateDoctor,
    getDoctorAppointments
} from '../controllers/doctor.controller.js';
import { getAvailableSlots } from '../controllers/doctorScheduling.controller.js';
import { protect, authorize, authorizeAdminScope, requireRecentMfa, requireVerifiedEmail } from '../middlewares/auth.middleware.js';
import upload, { uploadTimeout, validateLicenseDocument, validateUploadSignature } from '../middlewares/upload.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { adminSchemas } from '../validations/schemas.js';

const router = express.Router();

// Public routes
router.get('/', getDoctors);
router.get('/slots/:id', getAvailableSlots);

// Protected routes (Doctor/Admin)
router.get('/appointments', protect, authorize('doctor'), getDoctorAppointments);
router.post('/call-next', protect, authorize('doctor'), requireVerifiedEmail, callNextPatient);
router.put('/complete-consultation/:id', protect, authorize('doctor'), requireVerifiedEmail, completeConsultation);
router.patch('/mark-absent/:id', protect, authorize('doctor'), requireVerifiedEmail, markPatientAbsent);
router.get('/availability/schedule', protect, authorize('doctor'), getAvailability);
router.put('/availability/schedule', protect, authorize('doctor'), requireVerifiedEmail, updateAvailability);
router.get('/verification/me', protect, authorize('doctor'), getMyVerification);
router.post('/verification/license', protect, authorize('doctor'), requireVerifiedEmail, uploadTimeout, upload.single('license'), validateUploadSignature, validateLicenseDocument, submitVerification);
router.post('/', protect, authorize('admin', 'doctor'), requireVerifiedEmail, createDoctor);
router.put('/profile', protect, authorize('doctor'), requireVerifiedEmail, updateDoctorProfile);
router.patch('/availability', protect, authorize('doctor'), requireVerifiedEmail, toggleAvailability);

// Admin Management
router.delete('/:id', protect, authorize('admin'), authorizeAdminScope('super-admin'), requireRecentMfa, validate(adminSchemas.doctorSuspend), deleteDoctor);
router.put('/:id', protect, authorize('admin'), authorizeAdminScope('operations', 'super-admin'), updateDoctor);

router.get('/:id', getDoctor);

export default router;

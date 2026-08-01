import express from 'express';
import { 
    createDoctor, 
    getDoctors, 
    getDoctor, 
    updateDoctorProfile, 
    submitVerification,
    getMyVerification,
    toggleAvailability,
    getAvailableSlots,
    callNextPatient,
    completeConsultation,
    markPatientAbsent,
    getAvailability,
    updateAvailability,
    deleteDoctor,
    updateDoctor,
    getDoctorAppointments
} from '../controllers/doctor.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/upload.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getDoctors);
router.get('/slots/:id', getAvailableSlots);

// Protected routes (Doctor/Admin)
router.get('/appointments', protect, authorize('doctor'), getDoctorAppointments);
router.post('/call-next', protect, authorize('doctor'), callNextPatient);
router.put('/complete-consultation/:id', protect, authorize('doctor'), completeConsultation);
router.patch('/mark-absent/:id', protect, authorize('doctor'), markPatientAbsent);
router.get('/availability/schedule', protect, authorize('doctor'), getAvailability);
router.put('/availability/schedule', protect, authorize('doctor'), updateAvailability);
router.get('/verification/me', protect, authorize('doctor'), getMyVerification);
router.post('/verification/license', protect, authorize('doctor'), upload.single('license'), submitVerification);
router.post('/', protect, authorize('admin', 'doctor'), createDoctor); 
router.put('/profile', protect, authorize('doctor'), updateDoctorProfile);
router.patch('/availability', protect, authorize('doctor'), toggleAvailability);

// Admin Management
router.delete('/:id', protect, authorize('admin'), deleteDoctor);
router.put('/:id', protect, authorize('admin'), updateDoctor);

router.get('/:id', getDoctor);

export default router;

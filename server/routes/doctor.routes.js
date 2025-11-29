import express from 'express';
import { 
    getDoctors, 
    getDoctor, 
    updateDoctorProfile, 
    toggleAvailability,
    getAvailableSlots,
    createDoctor
} from '../controllers/doctor.controller.js';
import { authorize, protect } from '../middlewares/auth.middleware.js';

const router = express.Router({ mergeParams: true });

// --- Public Routes (No authentication needed to view doctors/slots) ---
router.get('/', getDoctors);
router.get('/:id', getDoctor);
router.get('/:id/slots', getAvailableSlots);

// protected routes
router.post('/', protect, authorize('doctor' || 'admin'), createDoctor);
router.put('/profile', protect, authorize('doctor'), updateDoctorProfile);
router.put('/availability', protect, authorize('doctor'), toggleAvailability);

export default router;

import express from 'express';
import { 
    createDoctor, 
    getDoctors, 
    getDoctor, 
    updateDoctorProfile, 
    toggleAvailability,
    getAvailableSlots,
    callNextPatient,
    completeConsultation,
    deleteDoctor,
    updateDoctor,
    getDoctorAppointments
} from '../controllers/doctor.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getDoctors);
router.get('/:id', getDoctor);
router.get('/slots/:id', getAvailableSlots);

// Protected routes (Doctor/Admin)
router.use(protect);

router.post('/', authorize('admin', 'doctor'), createDoctor); 
router.put('/profile', authorize('doctor'), updateDoctorProfile);
router.patch('/availability', authorize('doctor'), toggleAvailability);

// Admin Management
router.delete('/:id', authorize('admin'), deleteDoctor);
router.put('/:id', authorize('admin'), updateDoctor);

// Queue Management
router.post('/call-next', authorize('doctor'), callNextPatient);
router.put('/complete-consultation/:id', authorize('doctor'), completeConsultation);
router.get('/appointments', authorize('doctor'), getDoctorAppointments);

export default router;

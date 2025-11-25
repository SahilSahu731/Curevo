import express from 'express';
import { 
    getClinics, 
    getClinic, 
    createClinic, 
    updateClinic, 
    getClinicDoctors 
} from '../controllers/clinic.controller.js';
import { authorize, protect } from '../middlewares/auth.middleware.js';

const router = express.Router({ mergeParams: true });

router.get('/', getClinics);
router.get('/:id', getClinic);
router.get('/:id/doctors', getClinicDoctors);

router.post('/', protect, authorize('admin'), createClinic);
router.put('/:id', protect, authorize('admin'), updateClinic);

export default router;

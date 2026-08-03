import express from 'express';
import { 
    getClinics, 
    getClinic, 
    createClinic, 
    updateClinic, 
    getClinicDoctors,
    deleteClinic 
} from '../controllers/clinic.controller.js';
import { authorize, authorizeAdminScope, protect } from '../middlewares/auth.middleware.js';

const router = express.Router({ mergeParams: true });

router.get('/', getClinics);
router.get('/:id', getClinic);
router.get('/:id/doctors', getClinicDoctors);

router.post('/', protect, authorize('admin'), authorizeAdminScope('operations', 'super-admin'), createClinic);
router.put('/:id', protect, authorize('admin'), authorizeAdminScope('operations', 'super-admin'), updateClinic);
router.delete('/:id', protect, authorize('admin'), authorizeAdminScope('super-admin'), deleteClinic);

export default router;

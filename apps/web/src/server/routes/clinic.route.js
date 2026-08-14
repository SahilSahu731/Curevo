import express from 'express';
import { 
    getClinics, 
    getClinic, 
    createClinic, 
    updateClinic, 
    getClinicDoctors,
    deleteClinic 
} from '../controllers/clinic.controller.js';
import { authorize, authorizeAdminScope, protect, requireRecentMfa } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { adminSchemas } from '../validations/schemas.js';

const router = express.Router({ mergeParams: true });

router.get('/', getClinics);
router.get('/:id', getClinic);
router.get('/:id/doctors', getClinicDoctors);

router.post('/', protect, authorize('admin'), authorizeAdminScope('operations', 'super-admin'), createClinic);
router.put('/:id', protect, authorize('admin'), authorizeAdminScope('operations', 'super-admin'), updateClinic);
router.delete('/:id', protect, authorize('admin'), authorizeAdminScope('super-admin'), requireRecentMfa, validate(adminSchemas.clinicDeactivate), deleteClinic);

export default router;

import express from 'express';
import { 
    getDashboardStats, 
    getAllUsers, 
    updateUser, 
    deleteUser, 
    getUserAppointments,
    getAllAppointments
} from '../controllers/admin.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/users/:id/appointments', getUserAppointments);
router.get('/appointments', getAllAppointments);

export default router;

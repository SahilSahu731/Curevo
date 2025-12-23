import express from 'express';
import { getDashboardStats } from '../controllers/admin.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/dashboard', protect, authorize('admin'), getDashboardStats);

export default router;

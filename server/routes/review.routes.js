import express from 'express';
import { getDoctorReviews, createReview } from '../controllers/review.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/:doctorId', getDoctorReviews);
router.post('/', protect, createReview);

export default router;

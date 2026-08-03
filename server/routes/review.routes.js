import express from 'express';
import { getDoctorReviews, createReview } from '../controllers/review.controller.js';
import { authorize, protect, requireVerifiedEmail } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/:doctorId', getDoctorReviews);
router.post('/', protect, authorize('patient'), requireVerifiedEmail, createReview);

export default router;

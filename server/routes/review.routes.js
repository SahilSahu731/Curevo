import express from 'express';
import rateLimit from "express-rate-limit";
import { appealReviewModeration, createReview, getDoctorReviews, moderateReview, reportReview, respondToReview, updateReview, withdrawReview } from '../controllers/review.controller.js';
import { authorize, protect, requireVerifiedEmail } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/:doctorId', getDoctorReviews);
const reviewLimiter = rateLimit({ windowMs: 60 * 60_000, limit: 8, standardHeaders: true, legacyHeaders: false });
router.post('/', protect, authorize('patient'), requireVerifiedEmail, reviewLimiter, createReview);
router.patch('/:id', protect, authorize('patient'), requireVerifiedEmail, reviewLimiter, updateReview);
router.delete('/:id', protect, authorize('patient'), requireVerifiedEmail, withdrawReview);
router.post('/:id/report', protect, requireVerifiedEmail, reviewLimiter, reportReview);
router.post('/:id/response', protect, authorize('doctor'), requireVerifiedEmail, respondToReview);
router.post('/:id/appeal', protect, authorize('doctor'), requireVerifiedEmail, appealReviewModeration);
router.patch('/:id/moderate', protect, authorize('admin'), moderateReview);

export default router;

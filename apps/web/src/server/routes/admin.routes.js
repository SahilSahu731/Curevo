import express from 'express';
import {
    getDashboardStats,
    getAllUsers,
    updateUser, 
    deleteUser
} from '../controllers/admin.controller.js';
import { getAllFeedback, updateFeedback } from '../controllers/feedback.controller.js';
import { getSupportTickets, updateSupportTicket } from '../controllers/support.controller.js';
import { archivePost, createPost, getAdminPost, listAdminPosts, updatePost } from '../controllers/blog.controller.js';
import { protect, authorize, requireRecentMfa } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { adminSchemas, feedbackSchemas, supportSchemas } from '../validations/schemas.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/users', validate(adminSchemas.users), getAllUsers);
router.put('/users/:id', requireRecentMfa, validate(adminSchemas.userUpdate), updateUser);
router.delete('/users/:id', requireRecentMfa, validate(adminSchemas.userDeactivate), deleteUser);
router.get('/feedback', getAllFeedback);
router.patch('/feedback/:id', validate(feedbackSchemas.update), updateFeedback);
router.get('/support-tickets', validate(supportSchemas.list), getSupportTickets);
router.patch('/support-tickets/:id', validate(supportSchemas.update), updateSupportTicket);
router.get('/blog', listAdminPosts);
router.post('/blog', validate(adminSchemas.blogCreate), createPost);
router.get('/blog/:id', validate(adminSchemas.blogId), getAdminPost);
router.patch('/blog/:id', validate(adminSchemas.blogUpdate), updatePost);
router.delete('/blog/:id', validate(adminSchemas.blogId), archivePost);

export default router;

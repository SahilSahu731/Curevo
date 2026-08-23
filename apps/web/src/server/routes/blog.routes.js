import express from "express";

import { getPublishedPost, listPublishedPosts } from "../controllers/blog.controller.js";

const router = express.Router();

router.get("/", listPublishedPosts);
router.get("/:slug", getPublishedPost);

export default router;

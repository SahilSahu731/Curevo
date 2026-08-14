import express from "express";

import {
  completeRoutine,
  createReflection,
  createRoutine,
  createSession,
  deleteReflection,
  deleteRoutine,
  deleteSession,
  getOverview,
  listReflections,
  listRoutines,
  listSessions,
  updateRoutine,
  updateSession,
} from "../controllers/focus.controller.js";
import { protect, requireVerifiedEmail } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { focusSchemas } from "../validations/focus.schemas.js";

const router = express.Router();
router.use(protect);

router.get("/overview", getOverview);
router.get("/sessions", validate(focusSchemas.list), listSessions);
router.post("/sessions", requireVerifiedEmail, validate(focusSchemas.createSession), createSession);
router.patch("/sessions/:id", requireVerifiedEmail, validate(focusSchemas.updateSession), updateSession);
router.delete("/sessions/:id", requireVerifiedEmail, validate(focusSchemas.id), deleteSession);

router.get("/routines", listRoutines);
router.post("/routines", requireVerifiedEmail, validate(focusSchemas.createRoutine), createRoutine);
router.patch("/routines/:id", requireVerifiedEmail, validate(focusSchemas.updateRoutine), updateRoutine);
router.delete("/routines/:id", requireVerifiedEmail, validate(focusSchemas.id), deleteRoutine);
router.post("/routines/:id/complete", requireVerifiedEmail, validate(focusSchemas.completeRoutine), completeRoutine);

router.get("/reflections", validate(focusSchemas.list), listReflections);
router.post("/reflections", requireVerifiedEmail, validate(focusSchemas.createReflection), createReflection);
router.delete("/reflections/:id", requireVerifiedEmail, validate(focusSchemas.id), deleteReflection);

export default router;

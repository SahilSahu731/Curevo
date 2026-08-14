import mongoose from "mongoose";

const RoutineSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    cue: { type: String, trim: true, maxlength: 160 },
    durationMinutes: { type: Number, required: true, min: 1, max: 180, default: 25 },
    days: {
      type: [{ type: String, enum: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] }],
      default: ["mon", "tue", "wed", "thu", "fri"],
    },
    preferredTime: { type: String, match: /^([01]\d|2[0-3]):[0-5]\d$/, default: "09:00" },
    color: { type: String, enum: ["forest", "clay", "amber", "sky", "plum"], default: "forest" },
    active: { type: Boolean, default: true, index: true },
    completionCount: { type: Number, min: 0, default: 0 },
    lastCompletedAt: Date,
  },
  { timestamps: true },
);
RoutineSchema.add({ isSynthetic: { type: Boolean, default: false, index: true }, seedBatch: { type: String, index: true } });

RoutineSchema.index({ userId: 1, active: 1, createdAt: -1 });

const Routine = mongoose.models.Routine || mongoose.model("Routine", RoutineSchema);
export default Routine;

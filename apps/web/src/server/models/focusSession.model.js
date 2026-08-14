import mongoose from "mongoose";

const FocusSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    routineId: { type: mongoose.Schema.Types.ObjectId, ref: "Routine" },
    intention: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    durationMinutes: { type: Number, required: true, min: 1, max: 240 },
    status: { type: String, enum: ["planned", "active", "completed", "cancelled"], default: "completed", index: true },
    startedAt: { type: Date, default: Date.now, index: true },
    completedAt: Date,
    distractionCount: { type: Number, min: 0, max: 999, default: 0 },
    closingNote: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true },
);
FocusSessionSchema.add({ isSynthetic: { type: Boolean, default: false, index: true }, seedBatch: { type: String, index: true } });

FocusSessionSchema.index({ userId: 1, startedAt: -1 });

const FocusSession = mongoose.models.FocusSession || mongoose.model("FocusSession", FocusSessionSchema);
export default FocusSession;

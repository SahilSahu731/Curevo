import mongoose from "mongoose";

const ReflectionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    focusLevel: { type: Number, required: true, min: 1, max: 5 },
    energyLevel: { type: Number, required: true, min: 1, max: 5 },
    feeling: {
      type: String,
      required: true,
      enum: ["clear", "steady", "stretched", "restless", "low"],
    },
    win: { type: String, trim: true, maxlength: 300 },
    friction: { type: String, trim: true, maxlength: 300 },
    nextStep: { type: String, trim: true, maxlength: 200 },
    note: { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: true },
);
ReflectionSchema.add({ isSynthetic: { type: Boolean, default: false, index: true }, seedBatch: { type: String, index: true } });

ReflectionSchema.index({ userId: 1, createdAt: -1 });

const Reflection = mongoose.models.Reflection || mongoose.model("Reflection", ReflectionSchema);
export default Reflection;

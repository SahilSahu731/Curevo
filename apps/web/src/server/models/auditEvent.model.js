import mongoose from "mongoose";

const AuditEventSchema = new mongoose.Schema({
  type: { type: String, required: true, index: true },
  outcome: { type: String, enum: ["success", "failure", "blocked"], required: true },
  actorUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  correlationId: { type: String, maxlength: 100, index: true },
  ipHash: { type: String, select: false },
  userAgent: { type: String, maxlength: 300 },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
}, { timestamps: true });

for (const operation of ["updateOne", "updateMany", "findOneAndUpdate", "deleteOne", "deleteMany", "findOneAndDelete"]) {
  AuditEventSchema.pre(operation, function (next) {
    const error = new Error("Audit events are append-only");
    error.name = "ImmutableAuditEvent";
    next(error);
  });
}

export default mongoose.models.AuditEvent || mongoose.model("AuditEvent", AuditEventSchema);

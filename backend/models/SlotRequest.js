import mongoose from "mongoose";

// User request to be notified or considered when no slots are available for a package
const slotRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: "Package", required: true },
    packageName: { type: String, required: true },
    preferredDate: { type: Date },
    note: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "contacted", "scheduled", "dismissed"],
      default: "pending",
    },
    contact: {
      name: String,
      email: String,
      phone: String,
    },
  },
  { timestamps: true }
);

slotRequestSchema.index({ packageId: 1, createdAt: -1 });
slotRequestSchema.index({ status: 1 });

const SlotRequest = mongoose.model("SlotRequest", slotRequestSchema);

export default SlotRequest;

import mongoose from "mongoose";

const packageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // e.g., "Premium Studio Package"
    trim: true,
  },
  description: {
    type: String,
    required: true, // e.g., "Complete photography studio with advanced equipment"
  },
  price: {
    type: Number,
    required: true, // e.g., 280
  },
  duration: {
    type: Number,
    required: true, // e.g., 6 (hours)
  },
  features: [
    {
      type: String,
      required: true, // e.g., "Professional DSLR cameras"
    },
  ],
  image: {
    type: String, // store image URL (e.g., for the camera image in your example)
    default: "",
  },
  isActive: {
    type: Boolean,
    default: true, // in case you want to deactivate packages instead of deleting
  },
}, { timestamps: true });

const Package = mongoose.model("Package", packageSchema);

export default Package;

const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    otp: {
      type: Number,
      required: true,
    },
    expireAt: {
      type: Date,
      default: () => Date.now() + 600000,
      index: { expires: 600 },
    },
  },

  { timestamps: true }
);

module.exports = mongoose.model("Otp", otpSchema);

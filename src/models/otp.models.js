import {Schema, model} from "mongoose";
import crypto from "crypto";

const otpSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User Id is required"]
  },
  otp: {
    type: String,
    required: [true, "OTP is required"]
  },
  email: {
    type: String,
    required: [true, "Email is required"]
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300 // OTP expires after 5 minutes
  }
}, {timestamps: true});

otpSchema.methods.isOtpCorrect = function(otp) {
  const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
  return otpHash === this.otp;
}

export const otpModel = model("Otp", otpSchema);
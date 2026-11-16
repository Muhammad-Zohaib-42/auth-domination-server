import {Schema, model} from "mongoose";

const sessionSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User Id is required"]
  },
  email: {
    type: String,
    required: [true, "Email is required"]
  },
  refreshToken: {
    type: String,
    required: [true, "Refresh token is required"]
  },
  ip: {
    type: String,
    required: [true, "IP address is required"]
  },
  userAgent: {
    type: String,
    required: [true, "User agent is required"]
  },
  revoked: {
    type: Boolean,
    default: false,
    enum: [true, false]
  }
}, {timestamps: true});

export const sessionModel = model("Session", sessionSchema);
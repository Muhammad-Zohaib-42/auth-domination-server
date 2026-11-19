import {Schema, model} from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { config } from "../config/config.js"

const userSchema = new Schema({
  avatar: {
    type: String
  },
  name: {
    type: String,
    required: [true, "Name is required"]
  },
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: [true, "Username must be unique"],
    trim: true,
    lowercase: true,
    minlength: [3, "Username must be at least 3 characters long"],
    maxlength: [30, "Username cannot exceed 30 characters"],
    match: [/^[a-zA-Z][a-zA-Z0-9_]{2,19}$/, "Username must start with a letter and contain only letters, numbers, and underscores"]
  },
  email: {
    type: String, 
    required: [true, "Email is required"],
    unique: [true, "Email must be unique"],
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email address"]
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    select: false
  },
  isVerified: {
    type: Boolean,
    default: false,
    enum: [true, false]
  },
  passwordResetToken: {
    type: String,
    default: null
  },
  passwordResetTokenExpires: {
    type: Date,
    default: null
  }
}, {timestamps: true})

userSchema.pre("save", async function() {
  if (!this.isModified("password")) return
  this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods.isPasswordCorrect = async function(password) {
  return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function() {
  return jwt.sign(
    {
      _id: this._id,
      avatar: this.avatar,
      name: this.name,
      username: this.username,
      email: this.email,
      isVerified: this.isVerified
    },
    config.ACCESS_TOKEN_SECRET,
    {
      expiresIn: config.ACCESS_TOKEN_EXPIRY
    }
  )
}

userSchema.methods.generateRefreshToken = function() {
  return jwt.sign(
    {
      _id: this._id
    },
    config.REFRESH_TOKEN_SECRET,
    {
      expiresIn: config.REFRESH_TOKEN_EXPIRY
    }
  )
}

export const userModel = model("User", userSchema)
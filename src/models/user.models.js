import {Schema, model} from "mongoose"
import bcrypt from "bcrypt"

const userSchema = new Schema({
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
    maxlength: [20, "Username cannot exceed 20 characters"],
    match: [/^[a-z0-9_]{3,20}$/, "Username can only contain letters, numbers, and underscores"]
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
  }
}, {timestamps: true})

userSchema.pre("save", async function() {
  if (!this.isModified("password")) return
  this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods.isPasswordCorrect = async function(password) {
  return await bcrypt.compare(password, this.password)
}

export const userModel = model("User", userSchema)
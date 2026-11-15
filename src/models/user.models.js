import {Schema, model} from "mongoose"
import bcrypt from "bcrypt"

const userSchema = new Schema({
  avatar: {
    type: String,
    required: [true, "Avatar is required"]
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
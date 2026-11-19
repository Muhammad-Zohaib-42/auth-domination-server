import * as z from 'zod'

export const registerUserControllerSchema = z.object({
  name: z.string({error: "Name is required"}),
  username: z.string({error: "Username is required"}).min(3, "Username must be atleast 3 characters").max(30, "Username cannot exceed 30 characters").regex(/^[a-zA-Z][a-zA-Z0-9_]{2,19}$/, "Username must start with a letter and contain only letters, numbers, and underscores"),
  email: z.string({error: "Email is required"}).email({error: "Please enter a valid email"}),
  password: z.string({error: "Password is required"}).min(8, "Password must be atleast 8 characters").max(50, "Password cannot exceed 50 characters")
})

export const loginUserControllerSchema = z.object({
  email: z.string({error: "Email is required"}).email({error: "Please enter a valid email"}),
  password: z.string({error: "Password is required"}).min(8, "Password must be atleast 8 characters").max(50, "Password cannot exceed 50 characters")
})

export const verifyEmailControllerSchema = z.object({
  email: z.string({error: "Email is required"}).email({error: "Please enter a valid email"}),
  otp: z.string({error: "OTP is required"})
})

export const updateProfileControllerSchema = z.object({
  name: z.string({error: "Name is required"}),
  username: z.string({error: "Username is required"}).min(3, "Username must be atleast 3 characters").max(30, "Username cannot exceed 30 characters").regex(/^[a-zA-Z][a-zA-Z0-9_]{2,19}$/, "Username must start with a letter and contain only letters, numbers, and underscores")
})

export const updatePasswordControllerSchema = z.object({
  oldPassword: z.string({error: "oldPassword is required"}).min(8, "Password must be atleast 8 characters").max(50, "Password cannot exceed 50 characters"),
  newPassword: z.string({error: "newPassword is required"}).min(8, "Password must be atleast 8 characters").max(50, "Password cannot exceed 50 characters")
})

export const forgotPasswordControllerSchema = z.object({
  email: z.string({error: "Email is required"}).email({error: "Please enter a valid email"})
})

export const verifyResetPasswordOtpControllerSchema = z.object({
  otp: z.string({error: "OTP is required"}).length(6, "OTP must of 6 digit")
})

export const resetPasswordControllerSchema = z.object({
  password: z.string({error: "Password is required"}).min(8, "Password must be atleast 8 characters").max(50, "Password cannot exceed 50 characters")
})

export const resetEmailControllerSchema = z.object({
  email: z.string({error: "Email is required"}).email("Please enter a valid email")
})

export const verifyResetEmailControllerSchema = z.object({
  otp: z.string({error: "OTP is required"}).length(6, "OTP must of 6 digit")
})
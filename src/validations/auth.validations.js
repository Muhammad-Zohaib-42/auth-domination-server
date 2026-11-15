import * as z from 'zod'

export const registerUserControllerSchema = z.object({
  avatar: z.string("Avatar is required"),
  name: z.string("Name is required"),
  username: z.string().min(3, "Username must be atleast 3 characters").max(30, "Username cannot exceed 30 characters").regex(/^[a-zA-Z][a-zA-Z0-9_]{2,19}$/, "Username must start with a letter and contain only letters, numbers, and underscores"),
  email: z.email("Please enter a valid email"),
  password: z.string().min(8, "Password must be atleast 8 characters").max(50, "Password cannot exceed 50 characters")
})
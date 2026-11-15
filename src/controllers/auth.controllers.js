import {asyncHandler} from "../utils/asyncHandler.utils.js"
import { registerUserControllerSchema } from "../validations/auth.validations.js"
import {apiResponse} from "../utils/apiResponse.utils.js"
import {userModel} from "../models/user.models.js"
import { uploadOnCloudinary } from "../services/cloudinary.services.js"
import { generateOtp, generateOtpHtml } from "../utils/utils.js"
import crypto from "crypto"
import {otpModel} from "../models/otp.models.js"
import { sendEmail } from "../services/email.services.js"

/**
 * Handles new user registration.
 * 
 * Validates the incoming user data, check if the email already exists, hashes the password, upload image on cloudinary, sends OTP to user email, and save a new user to database.
 * 
 * @param {string} req.body.avatar - The URL of users profile image
 * @param {string} req.body.name - The full name of user
 * @param {string} req.body.username - The unique username of the user
 * @param {string} req.body.email - The unique email address of the user
 * @param {string} req.body.password - The raw password to be hashed
 * 
 * @returns {Promise} Sends a 201 JSON response with the created user
 */
export const registerUserController = asyncHandler(async (req, res) => {
  const result = registerUserControllerSchema.safeParse(req.body || {})

  if (!result.success) {
    return res.status(400).json(
      new apiResponse(400, result.error.flatten(), false)
    )
  }

  const avatar = req.file
  const {name, username, email, password} = result.data

  if (!avatar) {
    return res.status(400).json(
      new apiResponse(400, "Avatar is required", false)
    )
  }

  const existedUser = await userModel.findOne({
    $or: [{username}, {email}]
  })

  if (existedUser) {
    return res.status(409).json(
      new apiResponse(409, "User with this username or email already exist", false)
    )
  }

  const avatarLiveUrl = await uploadOnCloudinary(avatar.path)

  const user = await userModel.create({
    avatar: avatarLiveUrl,
    name, 
    username,
    email,
    password
  })

  const otp = generateOtp()
  const otpHash = crypto.createHash("sha256").update(otp).digest("hex")

  await otpModel.create({user: user._id, email, otp: otpHash})
  await sendEmail(email, otp)

  return res.status(200).json(
    new apiResponse(200, "User registered successfully", true, { 
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        isVerified: user.isVerified
      }
    })
  )
})

export const loginUserController = asyncHandler(async (req, res) => {})

export const verifyEmailController = asyncHandler(async (req, res) => {})

export const rotateTokensController = asyncHandler(async (req, res) => {})

export const logoutUserController = asyncHandler(async (req, res) => {})

export const deleteUserController = asyncHandler(async (req, res) => {})

export const getMeController = asyncHandler(async (req, res) => {})

export const updateProfileController = asyncHandler(async (req, res) => {})

export const updateAvatarController = asyncHandler(async (req, res) => {})

export const updatePasswordController = asyncHandler(async (req, res) => {})

export const forgotPasswordController = asyncHandler(async (req, res) => {})

export const verifyResetPasswordOtpController = asyncHandler(async (req, res) => {})

export const resetPasswordController = asyncHandler(async (req, res) => {})

export const resetEmailController = asyncHandler(async (req, res) => {})

export const verifyResetEmailOtpController = asyncHandler(async (req, res) => {})
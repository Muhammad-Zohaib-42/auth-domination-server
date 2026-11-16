import {asyncHandler} from "../utils/asyncHandler.utils.js"
import { registerUserControllerSchema, loginUserControllerSchema, verifyEmailControllerSchema } from "../validations/auth.validations.js"
import {apiResponse} from "../utils/apiResponse.utils.js"
import {userModel} from "../models/user.models.js"
import { uploadOnCloudinary } from "../services/cloudinary.services.js"
import { generateAccessAndRefreshToken, generateOtp } from "../utils/utils.js"
import crypto from "crypto"
import {otpModel} from "../models/otp.models.js"
import { sendEmail } from "../services/email.services.js"
import {sessionModel} from "../models/session.models.js"
import { refreshTokenCookieOptions } from "../constants.js"

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

  return res.status(201).json(
    new apiResponse(201, "User registered successfully", true, { 
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

/**
 * Handles user login.
 * 
 * Validates the incoming user data, check if user exists, verifies the password, generates access and refresh tokens, creates session, and sets authentication cookies.
 * 
 * @param {string} req.body.email - The unique email address of the user
 * @param {string} req.body.password - The raw password to be hashed
 * 
 * @returns {Promise} Sends a 200 JSON response with user data and authentication tokens
 */
export const loginUserController = asyncHandler(async (req, res) => {
  const result = loginUserControllerSchema.safeParse(req.body || {})

  if (!result.success) {
    return res.status(400).json(
      new apiResponse(400, result.error.flatten(), false)
    )
  }

  const {email, password} = result.data

  const existedUser = await userModel.findOne({email}).select("+password")

  if (!existedUser) {
    return res.status(409).json(
      new apiResponse(409, "User with this email doesn't exist", false)
    )
  }

  if (!existedUser.isVerified) {
    return res.status(403).json(
      new apiResponse(403, "User is not verified", false)
    )
  }

  const isPasswordCorrect = await existedUser.isPasswordCorrect(password)

  if (!isPasswordCorrect) {
    return res.status(409).json(
      new apiResponse(409, "Incorrect password", false)
    )
  }

  const {accessToken, refreshToken} = generateAccessAndRefreshToken(existedUser)
  const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex")

  await sessionModel.create({
    user: existedUser._id,
    email: existedUser.email,
    refreshToken: refreshTokenHash,
    ip: req.ip,
    userAgent: req.headers["user-agent"]
  })

  return res.status(200).cookie("refreshToken", refreshToken, refreshTokenCookieOptions).json(
    new apiResponse(200, "User loggedIn successfully", true, {
      user: existedUser,
      accessToken
    })
  )
})

/**
 * Handles Email verification.
 * 
 * Verifies email through OTP, sets user as verified, generates access and refresh tokens, creates session, and sets authentication cookies.
 * 
 * @param {string} req.body.email - The unique email address of the user
 * @param {string} req.body.otp - The raw otp
 * 
 * @returns {Promise} Sends a 200 JSON response with user data and authentication tokens
 */
export const verifyEmailController = asyncHandler(async (req, res) => {
  const result = verifyEmailControllerSchema.safeParse(req.body || {})

  if (!result.success) {
    return res.status(400).json(
      new apiResponse(400, result.error.flatten(), false)
    )
  }

  const {email, otp} = result.data

  const user = await userModel.findOne({email})

  if (!user) {
    return res.status(409).json(
      new apiResponse(409, "User with this email doesn't exist", false)
    )
  }

  const otpHash = crypto.createHash("sha256").update(otp).digest("hex")

  const otpDoc = await otpModel.findOne({otp: otpHash})

  if (!otpDoc) {
    return res.status(409).json(
      new apiResponse(409, "OtpDoc not found", false)
    )
  }

  await otpModel.deleteMany({email})
  
  user.isVerified = true
  await user.save()

  const {accessToken, refreshToken} = generateAccessAndRefreshToken(user)

  const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex")

  await sessionModel.create({
    user: user._id,
    email: user.email,
    refreshToken: refreshTokenHash,
    ip: req.ip,
    userAgent: req.headers["user-agent"]
  })

  return res.status(200).cookie("refreshToken", refreshToken, refreshTokenCookieOptions).json(
    new apiResponse(200, "Email verified successfully", true, {
      user,
      accessToken
    })
  )
})

/**
 * Handles Rotate Access And Refresh Token.
 * 
 * Expects refresh token, verifies it, verifies session, generates access and refresh token, and sets authentication cookies.
 * 
 * @param {string} req.cookies.refreshToken - The refresh token
 * 
 * @returns {Promise} Sends a 200 JSON response with authentication tokens
 */
export const rotateTokensController = asyncHandler(async (req, res) => {
  const {refreshToken} = req.cookies

  if (!refreshToken) {
    return res.status(400).json(
      new apiResponse(400, "Refresh Token is required", false)
    )
  }
})

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
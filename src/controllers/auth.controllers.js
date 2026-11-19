import {asyncHandler} from "../utils/asyncHandler.utils.js"
import { registerUserControllerSchema, loginUserControllerSchema, verifyEmailControllerSchema, updateProfileControllerSchema, updatePasswordControllerSchema, forgotPasswordControllerSchema, verifyResetPasswordOtpControllerSchema, resetPasswordControllerSchema, resetEmailControllerSchema, verifyResetEmailControllerSchema } from "../validations/auth.validations.js"
import {apiResponse} from "../utils/apiResponse.utils.js"
import {userModel} from "../models/user.models.js"
import { uploadOnCloudinary } from "../services/cloudinary.services.js"
import { generateAccessAndRefreshToken, generateOtp } from "../utils/utils.js"
import crypto from "crypto"
import {otpModel} from "../models/otp.models.js"
import { sendEmail } from "../services/email.services.js"
import {sessionModel} from "../models/session.models.js"
import { passwordResetTokenCookieOptions, refreshTokenCookieOptions } from "../constants.js"
import jwt from "jsonwebtoken"
import {config} from "../config/config.js"

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

  const {name, username, email, password} = result.data

  const existedUser = await userModel.findOne({
    $or: [{username}, {email}]
  })

  if (existedUser) {
    return res.status(409).json(
      new apiResponse(409, "User with this username or email already exist", false)
    )
  }

  const user = await userModel.create({
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
        avatar: user.avatar,
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

  let decoded = null

  try {
    decoded = jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET)
  } catch(error) {
    return res.status(401).json(
      new apiResponse(401, "Invalid refresh token", false)
    )
  }

  const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex")

  const session = await sessionModel.findOne({refreshToken: refreshTokenHash, revoked: false})

  if (!session) {
    return res.status(401).json(
      new apiResponse(401, "session revoked", false)
    )
  }

  const user = await userModel.findOne({_id: decoded._id})

  const {accessToken, refreshToken: newRefreshToken} = generateAccessAndRefreshToken(user)

  const newRefreshTokenHash = crypto.createHash("sha256").update(newRefreshToken).digest("hex")

  session.refreshToken = newRefreshTokenHash
  await session.save()

  return res.status(200).cookie("refreshToken", newRefreshToken, refreshTokenCookieOptions).json(
    new apiResponse(200, "Tokens rotated successfully", true, {
      accessToken
    })
  )
})

/**
 * Handles user logout.
 * 
 * Expects access token, verifies it, revoke the session, and clears refresh token cookie.
 * 
 * @param {string} req.headers[authorization] - The access token
 * 
 * @returns {Promise} Sends a 200 JSON response with a clear message
 */
export const logoutUserController = asyncHandler(async (req, res) => {
  const {refreshToken} = req.cookies

  if (!refreshToken) {
    return res.status(400).json(
      new apiResponse(400, "Refresh Token is required", false)
    )
  }

  let decoded = null

  try {
    decoded = jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET)
  } catch (error) {
    return res.status(401).json(
      new apiResponse(401, "Invalid refresh token", false)
    )
  }

  const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest('hex')

  const session = await sessionModel.findOne({refreshToken: refreshTokenHash, revoked: false})

  if (!session) {
    return res.status(409).json(
      new apiResponse(409, "session with this refresh token doesn't exist", false)
    )
  }

  session.revoked = true
  await session.save()

  return res.status(200).clearCookie("refreshToken", refreshTokenCookieOptions).json(
    new apiResponse(200, "User loggedOut successfully", false)
  )
})

/**
 * Handles user delete.
 * 
 * Expects access token, verifies it, decodes the token, find the user and deletes it.
 * 
 * @param {string} req.headers[authorization] - The access token
 * 
 * @returns {Promise} Sends a 200 JSON response with a clear message
 */
export const deleteUserController = asyncHandler(async (req, res) => {
  const {user} = req

  await userModel.findByIdAndDelete(user._id)
  await sessionModel.deleteMany({user: user._id})

  return res.status(200).clearCookie("refreshToken", refreshTokenCookieOptions).json(
    new apiResponse(200, "User deleted successfully", false)
  )
})

/**
 * Returns the user data.
 * 
 * Expects access token, verifies it, decodes the token, find the user and returns it.
 * 
 * @param {string} req.headers[authorization] - The access token
 * 
 * @returns {Promise} Sends a 200 JSON response with a user data
 */
export const getMeController = asyncHandler(async (req, res) => {
  const {user} = req

  return res.status(200).json(
    new apiResponse(200, "User data fetched successfully", true, {user})
  )
})

/**
 * Updates user name and username.
 * 
 * Expects access token, user name and username, verifies token, updates user name and username with given data.
 * 
 * @param {string} req.headers[authorization] - The access token
 * @param {string} req.body.name - user full name
 * @param {string} req.body.username - users unique username
 * 
 * @returns {Promise} Sends a 200 JSON response with updated user data
 */
export const updateProfileController = asyncHandler(async (req, res) => {
  const {user} = req
  const result = updateProfileControllerSchema.safeParse(req.body)

  if (!result.success) {
    return res.status(400).json(
      new apiResponse(400, result.error.flatten(), false)
    )
  }

  const {name, username} = result.data
  
  user.name = name
  user.username = username

  await user.save()

  return res.status(200).json(
    new apiResponse(200, "User Info update successfully", true, {user})
  )
})

/**
 * Updates avatar.
 * 
 * Expects avatar file, uploads the file on cloudinary, and saves live url in user doc.
 * 
 * @param {string} req.headers[authorization] - The access token
 * @param {string} req.file - user avatar file
 * 
 * @returns {Promise} Sends a 200 JSON response with updated user data
 */
export const updateAvatarController = asyncHandler(async (req, res) => {
  const {user} = req
  const avatar = req.file

  if (!avatar) {
    return res.status(400).json(
      new apiResponse(400, "Avatar is required", false)
    )
  }

  const liveAvatarUrl = await uploadOnCloudinary(avatar.path)

  user.avatar = liveAvatarUrl
  await user.save()

  return res.status(200).json(
    new apiResponse(200, "User avatar updated successfully", true, {user})
  )
})

/**
 * Updates user password.
 * 
 * Expects access token, old password and new password, verifies access token, and updates the password with new password.
 * 
 * @param {string} req.headers[authorization] - The access token
 * @param {string} req.body.oldPassword - users current or old password
 * @param {string} req.body.newPassword - users new password
 * 
 * @returns {Promise} Sends a 200 JSON response with updated user data
 */
export const updatePasswordController = asyncHandler(async (req, res) => {
  const {user} = req
  const result = updatePasswordControllerSchema.safeParse(req.body)

  if (!result.success) {
    return res.status(400).json(
      new apiResponse(400, result.error.flatten(), false)
    )
  }

  const {oldPassword, newPassword} = result.data

  const userDoc = await userModel.findById(user._id).select("+password")

  const isPasswordCorrect = await userDoc.isPasswordCorrect(oldPassword)

  if (!isPasswordCorrect) {
    return res.status(409).json(
      new apiResponse(409, "Incorrect Password", false)
    )
  }

  userDoc.password = newPassword
  await userDoc.save()

  return res.status(200).json(
    new apiResponse(200, "Password updated successfully", true)
  )
})

/**
 * Sends OTP email.
 * 
 * creates otp doc and sends OTP verification email to user.
 * 
 * @param {string} req.body.email - users unique email
 * 
 * @returns {Promise} Sends a 200 JSON response with success message
 */
export const forgotPasswordController = asyncHandler(async (req, res) => {
  const result = forgotPasswordControllerSchema.safeParse(req.body)

  if (!result.success) {
    return res.status(200).json(
      new apiResponse(200, result.error.flatten(), false)
    )
  }

  const {email} = result.data

  const user = await userModel.findOne({email})

  if (!user) {
    return res.status(409).json(
      new apiResponse(409, "user with this email doesn't eixst", false)
    )
  }

  const otp = generateOtp()
  const otpHash = crypto.createHash("sha256").update(otp).digest('hex')

  await otpModel.create({otp: otpHash, user: user._id, email})
  await sendEmail(email, otp)

  return res.status(200).json(
    new apiResponse(200, "OTP Doc created and Verification Email sent successfully", true)
  )
})

/**
 * Verifies OTP.
 * 
 * Verifies user email by verifying OTP.
 * 
 * @param {string} req.body.otp - users unique OTP
 * 
 * @returns {Promise} Sends a 200 JSON response with success message
 */
export const verifyResetPasswordOtpController = asyncHandler(async (req, res) => {
  const result = verifyResetPasswordOtpControllerSchema.safeParse(req.body)

  if (!result.success) {
    return res.status(400).json(
      new apiResponse(400, result.error.flatten(), false)
    )
  }

  const {otp} = result.data

  const otpHash = crypto.createHash("sha256").update(otp).digest("hex")

  const otpDoc = await otpModel.findOne({otp: otpHash})

  if (!otpDoc) {
    return res.status(409).json(
      new apiResponse(409, "OTP Doc not found", false)
    )
  }

  const user = await userModel.findById(otpDoc.user)

  await otpModel.findOneAndDelete({otp: otpHash})

  const passwordResetToken = crypto.randomBytes(32).toString("hex")
  const passwordResetTokenHash = crypto.createHash("sha256").update(passwordResetToken).digest("hex")

  user.passwordResetToken = passwordResetTokenHash
  user.passwordResetTokenExpires = new Date(Date.now() + (15 * 60 * 1000))

  await user.save()

  return res.status(200).cookie("passwordResetToken", passwordResetToken, passwordResetTokenCookieOptions).json(
    new apiResponse(200, "Email verified successfully", true)
  )
})

/**
 * Resets user password.
 * 
 * Verifies password reset token and resets user password.
 * 
 * @param {string} req.body.password - user new password
 * 
 * @returns {Promise} Sends a 200 JSON response with updated user data
 */
export const resetPasswordController = asyncHandler(async (req, res) => {
  const result = resetPasswordControllerSchema.safeParse(req.body)
  const {passwordResetToken} = req.cookies

  if (!result.success) {
    return res.status(400).json(
      new apiResponse(400, result.error.flatten(), false)
    )
  }

  if (!passwordResetToken) {
    return res.status(400).json(
      new apiResponse(400, "Password Reset Token is required", false)
    )
  }

  const {password} = result.data

  const passwordResetTokenHash = crypto.createHash("sha256").update(passwordResetToken).digest("hex")

  const user = await userModel.findOne({passwordResetToken: passwordResetTokenHash}).select("+password")

  if (!user) {
    return res.status(409).json(
      new apiResponse(409, "user with this password reset token not found", false)
    )
  }

  if (user.passwordResetTokenExpires < Date.now()) {
    return res.status(401).json(
      new apiResponse(401, "password reset token expires", false)
    )
  }

  user.password = password
  user.passwordResetToken = null
  user.passwordResetTokenExpires = null
  await user.save()

  return res.status(200).clearCookie("passwordResetToken", passwordResetTokenCookieOptions).json(
    new apiResponse(200, "Password updated successfully", true, {user})
  )
})

/**
 * Handles user email reset.
 * 
 * Resets Email and flag user as unverified.
 * 
 * @param {string} req.body.email - user unique email
 * 
 * @returns {Promise} Sends a 200 JSON response with updated user data
 */
export const resetEmailController = asyncHandler(async (req, res) => {
  const {user} = req
  const result = resetEmailControllerSchema.safeParse(req.body)

  if (!result.success) {
    return res.status(400).json(
      new apiResponse(400, result.error.flatten(), false)
    )
  }

  const {email} = result.data

  user.email = email
  user.isVerified = false
  await user.save()

  const otp = generateOtp()
  const otpHash = crypto.createHash("sha256").update(otp).digest("hex")

  await otpModel.create({otp: otpHash, user: user._id, email})

  await sendEmail(email, otp)

  return res.status(200).json(
    new apiResponse(200, "User Email updated successfully, verification needed", true, {user})
  )
})

/**
 * Verifies email.
 * 
 * Expects OTP, verifies it, and update user isVerified flag true.
 * 
 * @param {string} req.body.otp - user unique OTP
 * 
 * @returns {Promise} Sends a 200 JSON response with updated user data
 */
export const verifyResetEmailOtpController = asyncHandler(async (req, res) => {
  const {user} = req
  const result = verifyResetEmailControllerSchema.safeParse(req.body)

  if (!result.success) {
    return res.status(400).json(
      new apiResponse(400, result.error.flatten(), false)
    )
  }

  const {otp} = result.data
  const otpHash = crypto.createHash("sha256").update(otp).digest("hex")

  const otpDoc = await otpModel.findOne({otp: otpHash})

  if (!otpDoc) {
    return res.status(409).json(
      new apiResponse(409, "OTP Doc not found", false)
    )
  }

  user.isVerified = true
  await user.save()

  return res.status(200).json(
    new apiResponse(200, "User Email verified successfully", true, {user})
  )
})
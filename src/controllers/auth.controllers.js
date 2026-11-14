import {asyncHandler} from "../utils/asyncHandler.utils.js"

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
export const registerUserController = asyncHandler(async (req, res) => {})

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
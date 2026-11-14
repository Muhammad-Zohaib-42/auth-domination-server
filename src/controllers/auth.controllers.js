import {asyncHandler} from "../utils/asyncHandler.utils.js"

/**
 * @route POST /register
 * @desc register a new user, hash password, upload avatar, and send verification OTP
 * @access public
 * @param {avatar, name, username, email, password}
 * @returns {object} registration response
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
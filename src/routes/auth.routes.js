import {Router} from "express";
import * as authControllers from "../controllers/auth.controllers.js"
import {upload} from "../middlewares/multer.middlewares.js"

const router = Router();

/**
 * @route POST /register
 * @desc Register a new user
 * @access public
 */
router.post("/register", upload.single("avatar"), authControllers.registerUserController)

/**
 * @route POST /login
 * @description expects user email and password to login
 * @access public
 */
router.post("/login", authControllers.loginUserController)

/**
 * @route POST /verify-email
 * @description expects user email and otp to verify
 * @access public
 */
router.post("/verify-email", authControllers.verifyEmailController)

/**
 * @route POST /rotate-tokens
 * @description expects refresh token to rotate tokens
 * @access private
 */
router.post("/rotate-tokens", authControllers.rotateTokensController)

/**
 * @route POST /logout
 * @description expects access token to logout user
 * @access private
 */
router.post("/logout", authControllers.logoutUserController)

/**
 * @route DELETE /delete
 * @description expects access token to delete user account
 * @access private
 */
router.delete("/delete", authControllers.deleteUserController)

/**
 * @route GET /get-me
 * @description expects access token to get user data
 * @access private
 */
router.get("/get-me", authControllers.getMeController)

/**
 * @route PATCH /update-profile
 * @description expects access token and user name and username to update user info
 * @access private
 */
router.patch("/update-profile", authControllers.updateProfileController)

/**
 * @route PATCH /update-avatar
 * @description expects access token and user name and username to update user info
 * @access private
 */
router.patch("/update-avatar", authControllers.updateAvatarController)

/**
 * @route PATCH /update-password
 * @description expects access token and user old & new password to update the password
 * @access private
 */
router.patch("/update-password", authControllers.updatePasswordController)

/**
 * @route POST /forgot-password
 * @description sends a verification otp on email and allow user to reset password
 * @access public
 */
router.post("/forgot-password", authControllers.forgotPasswordController)

/**
 * @route POST /verify-reset-password-otp
 * @description expects reset password otp and verifies it and then allow user to reset password
 * @access public
 */
router.post("/verify-reset-password-otp", authControllers.verifyResetPasswordOtpController)

/**
 * @route POST /reset-password
 * @description expects password and update user old password with new one
 * @access public
 */
router.post("/reset-password", authControllers.resetPasswordController)

/**
 * @route POST /reset-email
 * @description sends the otp to email for verification
 * @access private
 */
router.post("/reset-email", authControllers.resetEmailController)

/**
 * @route PATCH /verify-reset-email-otp
 * @description verify email and update user email with new one
 * @access private
 */
router.patch("/verify-reset-email-otp", authControllers.verifyResetEmailOtpController)

export default router;
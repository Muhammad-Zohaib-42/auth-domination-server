import {Router} from "express";
import * as authControllers from "../controllers/auth.controllers.js"
import {upload} from "../middlewares/multer.middlewares.js"
import { authUser } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * @route POST /register
 * @desc Register a new user
 * @access public
 */
router.post("/register", upload.single("avatar"), authControllers.registerUserController)

/**
 * @route POST /login
 * @description Authenticate an existing user and login them in
 * @access public
 */
router.post("/login", authControllers.loginUserController)

/**
 * @route POST /verify-email
 * @description Verifies user email through OTP
 * @access public
 */
router.post("/verify-email", authControllers.verifyEmailController)

/**
 * @route POST /rotate-tokens
 * @description Rotates the access and refresh token
 * @access private
 */
router.post("/rotate-tokens", authControllers.rotateTokensController)

/**
 * @route POST /logout
 * @description logout the user
 * @access private
 */
router.post("/logout", authUser, authControllers.logoutUserController)

/**
 * @route DELETE /delete
 * @description deletes the user
 * @access private
 */
router.delete("/delete", authUser, authControllers.deleteUserController)

/**
 * @route GET /get-me
 * @description returns the user data
 * @access private
 */
router.get("/get-me", authUser, authControllers.getMeController)

/**
 * @route PATCH /update-profile
 * @description updates user name and username
 * @access private
 */
router.patch("/update-profile", authUser, authControllers.updateProfileController)

/**
 * @route PATCH /update-avatar
 * @description update the avatar
 * @access private
 */
router.patch("/update-avatar", authUser, upload.single("avatar"), authControllers.updateAvatarController)

/**
 * @route PATCH /update-password
 * @description updates user password
 * @access private
 */
router.patch("/update-password", authUser, authControllers.updatePasswordController)

/**
 * @route POST /forgot-password
 * @description Sends OTP verification email
 * @access public
 */
router.post("/forgot-password", authControllers.forgotPasswordController)

/**
 * @route POST /verify-reset-password-otp
 * @description verifies otp
 * @access public
 */
router.post("/verify-reset-password-otp", authControllers.verifyResetPasswordOtpController)

/**
 * @route PATCH /reset-password
 * @description Resets User password
 * @access public
 */
router.patch("/reset-password", authControllers.resetPasswordController)

/**
 * @route PATCH /reset-email
 * @description verifies user email
 * @access private
 */
router.patch("/reset-email", authUser, authControllers.resetEmailController)

/**
 * @route PATCH /verify-reset-email-otp
 * @description verifies email
 * @access private
 */
router.patch("/verify-reset-email-otp", authUser, authControllers.verifyResetEmailOtpController)

export default router;
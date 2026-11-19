import { config } from "./config/config.js"

export const DB_NAME = "auth-domination"

export const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: config.NODE_ENV == "production",
  sameSite: config.NODE_ENV == "development" ? "strict" : "none",
  maxAge: 1 * 60 * 60 * 1000
}

export const passwordResetTokenCookieOptions = {
  httpOnly: true,
  secure: config.NODE_ENV == "production",
  sameSite: config.NODE_ENV == "production" ? "none" : "strict",
  maxAge: 15 * 60 * 1000
}
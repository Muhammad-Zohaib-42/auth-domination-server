import "dotenv/config"

const MONGODB_URI = process.env.MONGODB_URI
const PORT = process.env.PORT
const NODE_ENV = process.env.NODE_ENV
const ORIGIN = process.env.ORIGIN
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET
const SMTP_USER = process.env.SMTP_USER
const SMTP_PASS = process.env.SMTP_PASS

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in the environment variables")
}

if (!PORT) {
  throw new Error("PORT is not defined in the environment variables")
}

if (!NODE_ENV) {
  throw new Error("NODE_ENV is not defined in the environment variables")
}

if (!ORIGIN) {
  throw new Error("ORIGIN is not defined in the environment variables")
}

if (!ACCESS_TOKEN_SECRET) {
  throw new Error("ACCESS_TOKEN_SECRET is not defined in the environment variables")
}

if (!ACCESS_TOKEN_EXPIRY) {
  throw new Error("ACCESS_TOKEN_EXPIRY is not defined in the environment variables")
}

if (!REFRESH_TOKEN_SECRET) {
  throw new Error("REFRESH_TOKEN_SECRET is not defined in the environment variables")
}

if (!REFRESH_TOKEN_EXPIRY) {
  throw new Error("REFRESH_TOKEN_EXPIRY is not defined in the environment variables")
}

if (!CLOUDINARY_CLOUD_NAME) {
  throw new Error("CLOUDINARY_CLOUD_NAME is not defined in the environment variables")
}

if (!CLOUDINARY_API_KEY) {
  throw new Error("CLOUDINARY_API_KEY is not defined in the environment variables")
}

if (!CLOUDINARY_API_SECRET) {
  throw new Error("CLOUDINARY_API_SECRET is not defined in the environment variables")
}

if (!SMTP_USER) {
  throw new Error("SMTP_USER is not defined in the environment variables")
}

if (!SMTP_PASS) {
  throw new Error("SMTP_PASS is not defined in the environment variables")
}

export const config = {
  MONGODB_URI,
  PORT,
  NODE_ENV,
  ORIGIN,
  ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRY,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  SMTP_USER,
  SMTP_PASS
}
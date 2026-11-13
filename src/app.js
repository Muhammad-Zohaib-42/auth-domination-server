import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import {config} from "./config/config.js"
import { apiResponse } from "./utils/apiResponse.utils.js"

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(cors({ origin: config.ORIGIN, credentials: true }))

// global error handler
app.use((err, req, res, next) => {
  const status = err.status || 500
  const message = err.message || "Internal Server Error"

  return res.status(status).json(
    new apiResponse(status, message, false)
  )
})

// importing routes
import authRoutes from "./routes/auth.routes.js"

// using routes
app.use("/api/v1/auth", authRoutes)

export default app
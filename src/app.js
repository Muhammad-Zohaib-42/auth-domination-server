import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import {config} from "./config/config.js"

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(cors({ origin: config.ORIGIN, credentials: true }))

// importing routes
import authRoutes from "./routes/auth.routes.js"

// using routes
app.use("/api/v1/auth", authRoutes)

export default app
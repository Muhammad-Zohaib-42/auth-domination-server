import { apiResponse } from "../utils/apiResponse.utils.js"
import jwt from "jsonwebtoken"
import { config } from "../config/config.js"
import { userModel } from "../models/user.models.js"

export async function authUser(req, res, next) {
  const fullAccessToken = req.headers["authorization"]

  if (!fullAccessToken) {
    return res.status(400).json(
      new apiResponse(400, "Access Token is required", false)
    )
  }

  const accessToken = fullAccessToken.split(" ")[1]

  let decoded = null

  try {
    decoded = jwt.verify(accessToken, config.ACCESS_TOKEN_SECRET)
  } catch(error) {
    return res.status(401).json(
      new apiResponse(401, "Invalid Access Token", false)
    )
  }

  const user = await userModel.findById(decoded._id)
  req.user = user

  next()
}
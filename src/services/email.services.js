import nodemailer from "nodemailer"
import { config } from "../config/config.js"
import { generateOtpHtml } from "../utils/utils.js"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.SMTP_USER,
    pass: config.SMTP_PASS
  }
})

export async function sendEmail(email, otp) {
  try {
    await transporter.sendMail({
      from: {
        name: "Auth Domination",
        address: config.SMTP_USER
      },
      to: email,
      subject: "Verify Your Email Address",
      html: generateOtpHtml(otp)
    })
  } catch (error) {
    console.log(`Error while sending Email! error: ${error}`)
  }
}
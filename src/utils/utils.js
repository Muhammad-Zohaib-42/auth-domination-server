export function generateOtp() {
  return Math.floor((Math.random() * 100000) + 99999).toString()
}

export function generateOtpHtml(otp) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify your email - ApplyFlow</title>

      <style>
        body {
          margin: 0;
          padding: 0;
          background: #f5f6f8;
          font-family: Arial, Helvetica, sans-serif;
          color: #1f2937;
        }

        .wrapper {
          width: 100%;
          padding: 35px 15px;
          box-sizing: border-box;
        }

        .container {
          max-width: 460px;
          margin: 0 auto;
          padding: 32px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          box-sizing: border-box;
        }

        .brand {
          margin: 0 0 35px;
          font-size: 21px;
          font-weight: 700;
          color: #2563eb;
        }

        h2 {
          margin: 0 0 12px;
          font-size: 23px;
          color: #111827;
        }

        .description {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
          line-height: 1.7;
        }

        .otp-label {
          margin: 28px 0 12px;
          font-size: 13px;
          font-weight: 600;
          color: #374151;
        }

        .otp-box {
          display: inline-block;
          margin-top: 5px;
          padding: 14px 22px;
          background: #f3f6fc;
          border: 1px solid #dbe4f0;
          border-radius: 7px;
        }

        .otp-code {
          margin: 0;
          color: #2563eb;
          font-size: 28px;
          font-weight: 700;
          letter-spacing: 5px;
          font-family: Arial, Helvetica, sans-serif;
        }

        .expiry {
          margin-top: 25px;
          padding: 12px 14px;
          background: #f9fafb;
          border-left: 3px solid #2563eb;
          color: #6b7280;
          font-size: 13px;
          line-height: 1.6;
        }

        .security {
          margin-top: 22px;
          color: #6b7280;
          font-size: 13px;
          line-height: 1.7;
        }

        .footer {
          margin-top: 30px;
          padding-top: 18px;
          border-top: 1px solid #e5e7eb;
          color: #9ca3af;
          font-size: 12px;
          line-height: 1.6;
        }

        @media screen and (max-width: 480px) {
          .container {
            padding: 24px 18px;
          }

          .otp-code {
            font-size: 25px;
            letter-spacing: 4px;
          }
        }
      </style>
    </head>

    <body>
      <div class="wrapper">
        <div class="container">

          <h1 class="brand">ApplyFlow</h1>

          <h2>Verify your email</h2>

          <p class="description">
            Thanks for signing up! Enter the verification
            code below to confirm your email address
            and complete your registration.
          </p>

          <p class="otp-label">Your verification code</p>

          <div class="otp-box">
            <p class="otp-code">${otp}</p>
          </div>

          <div class="expiry">
            This code expires in <strong>5 minutes</strong>.
            Please verify your email before it expires.
          </div>

          <p class="security">
            If you didn't create an ApplyFlow account,
            you can safely ignore this email.
            Never share this verification code with anyone.
          </p>

          <div class="footer">
            © ${new Date().getFullYear()} ApplyFlow. All rights reserved.
            <br>
            Automated email from ApplyFlow.
          </div>

        </div>
      </div>
    </body>
    </html>
  `;
}

export function generateAccessAndRefreshToken(user) {
  const accessToken = user.generateAccessToken()
  const refreshToken = user.generateRefreshToken()

  return {accessToken, refreshToken}
}
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) console.error("Gmail Service connection failed");
  else console.log(`Gmail configured properly and ready to send email.`);
});

export const sendOtpToEmail = async (email, token) => {
  const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <title>OTP Verification</title>
</head>

<body
  style="
    margin: 0;
    padding: 0;
    background-color: #f4f7fb;
    font-family: Arial, sans-serif;
  "
>
  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    style="padding: 40px 0;"
  >
    <tr>
      <td align="center">

        <table
          width="600"
          cellpadding="0"
          cellspacing="0"
          style="
            background: #ffffff;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          "
        >

          <!-- Logo / Heading -->
          <tr>
            <td align="center">
              <h1
                style="
                  margin: 0;
                  color: #111827;
                  font-size: 28px;
                "
              >
                Verify Your Account
              </h1>
            </td>
          </tr>

          <!-- Spacer -->
          <tr>
            <td height="20"></td>
          </tr>

          <!-- Message -->
          <tr>
            <td align="center">
              <p
                style="
                  color: #4b5563;
                  font-size: 16px;
                  line-height: 1.6;
                  margin: 0;
                "
              >
                Use the OTP below to complete your verification process.
              </p>
            </td>
          </tr>

          <!-- Spacer -->
          <tr>
            <td height="30"></td>
          </tr>

          <!-- OTP Box -->
          <tr>
            <td align="center">

              <div
                style="
                  display: inline-block;
                  background: #111827;
                  color: #ffffff;
                  padding: 16px 32px;
                  border-radius: 10px;
                  font-size: 32px;
                  font-weight: bold;
                  letter-spacing: 8px;
                "
              >
                482913
              </div>

            </td>
          </tr>

          <!-- Spacer -->
          <tr>
            <td height="30"></td>
          </tr>

          <!-- Expiry -->
          <tr>
            <td align="center">
              <p
                style="
                  color: #6b7280;
                  font-size: 14px;
                  margin: 0;
                "
              >
                This OTP is valid for 10 minutes.
              </p>
            </td>
          </tr>

          <!-- Spacer -->
          <tr>
            <td height="40"></td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center">
              <p
                style="
                  color: #9ca3af;
                  font-size: 13px;
                  line-height: 1.5;
                  margin: 0;
                "
              >
                If you didn’t request this code, you can safely ignore this email.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify Your Email",
    html: htmlBody,
  });
};

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 465,
  //   secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendMail = async (to, subject, resetLink) => {
  const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <title>Password Recovery</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #f6f9fc; padding: 20px; margin: 0;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center">
          <table style="max-width: 600px; background: white; border-radius: 8px; padding: 20px; box-shadow: 0 0 10px rgba(0,0,0,0.1);" width="100%">
            <tr>
              <td style="text-align: center;">
                <h2 style="color: #333;">Password Recovery</h2>
                <p style="color: #555;">We received a request to reset your password. Click the button below to proceed.</p>
                <a href="${resetLink}" style="display: inline-block; padding: 12px 20px; margin-top: 20px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px; font-size: 16px;">
                  Reset Password
                </a>
                <p style="color: #888; font-size: 12px; margin-top: 20px;">
                  If you didn’t request this, you can safely ignore this email.
                </p>
              </td>
            </tr>
          </table>
          <p style="color: #aaa; font-size: 12px; margin-top: 20px;">
            &copy; ${new Date().getFullYear()} Dev-social. All rights reserved.
          </p>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  const info = await transporter.sendMail({
    from: `"Dev-social" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html: htmlContent
  });

  return info;
};

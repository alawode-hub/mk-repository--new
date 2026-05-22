import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendVerificationEmail = async (email, token) => {
  const verifyLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"MK Collectives" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your email - MK Collectives",
    html: `
      <h3>Welcome to MK Collectives</h3>
      <p>Click the button below to verify your email:</p>
      <a href="${verifyLink}" style="padding:10px 20px; background:#000; color:#fff; text-decoration:none; border-radius:5px;">Verify Email</a>
      <p>This link expires in 1 hour. If you didn’t sign up, ignore this email.</p>
    `,
  });
};
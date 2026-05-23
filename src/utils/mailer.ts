import nodemailer from "nodemailer";

export async function sendEmail(
  to: string,
  subject: string,
  text?: string,
  html?: string
) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: process.env.SMTP_USER
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        }
      : undefined,
  });

  await transporter.sendMail({
    from: `"Magia das Velas" <${process.env.SMTP_USER || "no-reply@localhost"}>`,
    to,
    subject,
    text,
    html,
  });
}

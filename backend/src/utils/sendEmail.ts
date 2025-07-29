import nodemailer from 'nodemailer';

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
}

const sendEmail = async (options: EmailOptions): Promise<void> => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    // For development with Gmail
    // service: 'gmail',
    // auth: {
    //   user: process.env.GMAIL_USERNAME,
    //   pass: process.env.GMAIL_APP_PASSWORD,
    // },
  });

  // 2) Define the email options
  const mailOptions = {
    from: `JuniorQ <${process.env.EMAIL_FROM || 'noreply@juniorq.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: options.message, // For HTML formatted emails
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};

export default sendEmail;

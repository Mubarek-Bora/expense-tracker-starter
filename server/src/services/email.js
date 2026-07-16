const { Resend } = require('resend');

async function sendPasswordResetEmail(to, resetUrl) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: 'Finance Tracker <onboarding@resend.dev>',
    to,
    subject: 'Reset your Finance Tracker password',
    html: `
      <p>You requested a password reset for your Finance Tracker account.</p>
      <p><a href="${resetUrl}">Click here to set a new password</a></p>
      <p>This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
    `,
  });
}

module.exports = { sendPasswordResetEmail };

const nodemailer = require('nodemailer');

let transporter;

// Generate a test account with Ethereal and create a transporter.
// We only want to do this once.
const setupTransporter = async () => {
  if (transporter) {
    return transporter;
  }

  try {
    const testAccount = await nodemailer.createTestAccount();

    console.log('Ethereal test account created:');
    console.log(`User: ${testAccount.user}`);
    console.log(`Pass: ${testAccount.pass}`);

    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });

    return transporter;
  } catch (error) {
    console.error('Failed to create Ethereal test account:', error);
    // In a real app, you might want to fall back to a different email service
    // or handle this error more gracefully.
    throw new Error('Could not set up email transporter.');
  }
};

/**
 * Sends an email.
 * @param {object} mailOptions - The mail options.
 * @param {string} mailOptions.to - Recipient's email address.
 * @param {string} mailOptions.subject - Subject line.
 * @param {string} mailOptions.text - Plain text body.
 * @param {string} mailOptions.html - HTML body.
 */
const sendEmail = async (mailOptions) => {
  try {
    const emailTransporter = await setupTransporter();
    const info = await emailTransporter.sendMail({
      from: '"My Bank API" <noreply@mybank.com>', // sender address
      ...mailOptions,
    });

    console.log('Message sent: %s', info.messageId);
    // Preview only available when sending through an Ethereal account
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
    // We don't want to crash the app if email fails, just log it.
    // In a real production app, you'd want more robust error handling/monitoring.
  }
};

module.exports = { sendEmail, setupTransporter };

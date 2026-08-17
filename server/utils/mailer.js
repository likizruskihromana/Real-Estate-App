const nodemailer = require('nodemailer');
const config = require('../config/env');

let transporter;
function getTransporter() {
  if (!config.smtp.host) return null;
  if (!transporter) transporter = nodemailer.createTransport({
    host: config.smtp.host, port: config.smtp.port, secure: config.smtp.secure,
    auth: config.smtp.user ? { user: config.smtp.user, pass: config.smtp.password } : undefined,
  });
  return transporter;
}

async function sendSecurityEmail({ to, subject, text }) {
  const mailer = getTransporter();
  if (!mailer) {
    if (config.server.nodeEnv !== 'production') console.info(`[DOMUS EMAIL] ${to} | ${subject} | ${text}`);
    return false;
  }
  await mailer.sendMail({ from: config.smtp.from, to, subject, text });
  return true;
}
module.exports = { sendSecurityEmail };

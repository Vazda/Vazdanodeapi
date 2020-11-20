import nodemailer from 'nodemailer';

const config = {
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
};

const mailer = nodemailer.createTransport({
  ...config,
});


export default mailer;


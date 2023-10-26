const nodemailer = require('nodemailer');
require('dotenv')

const sendOTP = async (data) => {
  try {
    // Create a transporter with your email service provider's SMTP configuration
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'chandu.rawat14@gmail.com',
        pass: 'vtbapxgpvatcsnvy',
      },
    });

    // Define the email content
    const mailOptions = {
      from: 'chandraprakashrawat14@moreyeahs.in',
      to: data.email,
      subject: 'forgot password OTP',
      text: `This is your OTP :- ${data.OTP}`,
    };

    // Send the email and use await to make the operation asynchronous
    const info = await transporter.sendMail(mailOptions);
    return info
    // console.log('Email sent: ' + info.response);
  } catch (error) {
    // console.error('Error sending email: ' + error);
    return error
  }
}
 module.exports = sendOTP


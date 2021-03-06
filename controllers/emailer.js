const nodemailer = require('nodemailer')
//require('../.ENV')  // <---** uncomment when running locally ** \\

const sendEmail = (username, toAddress, message, subject) => {
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.EMAIL_PW
    }
  })

  const mailOptions = {
    from: 'The Wheel Deals App <cool.bike.app@gmail.com>',
    to: toAddress,
    subject: subject,
    text: `Greetings ${username},

    ${message}

    Respectfully,

    The Wheel Deals Team!`
  }

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response)
    }
  })
}

module.exports = sendEmail
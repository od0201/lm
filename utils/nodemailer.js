const nodemailer = require('nodemailer')
const keys = require('../keys')

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: keys.GMAIL_FROM, // generated ethereal user
      pass: keys.GMAIL_PASSWORD, // generated ethereal password
    },
  },
  {
    from :`mailer test <${keys.GMAIL_FROM}>`
  }
  );
  const sendMail = message=>{
    transporter.sendMail(message,(error,info)=>{
      if(error){return console.log(error)}
      console.log(`Email send ${info}`)
    })
  }
  // send mail with defined transport object
  // let info = await transporter.sendMail({
  //   to: "bar@example.com, baz@example.com", // list of receivers
  //   subject: "Hello ✔", // Subject line
  //   text: "Hello world?", // plain text body
  //   html: "<b>Hello world?</b>", // html body
  // })

  module.exports = sendMail
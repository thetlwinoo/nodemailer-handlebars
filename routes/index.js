var express = require('express');
var router = express.Router();

var MailConfig = require('../config/email');
var hbs = require('nodemailer-express-handlebars');
var gmailTransport = MailConfig.GmailTransport;
var smtpTransport = MailConfig.SMTPTransport;
const HummusRecipe = require('hummus-recipe');
var moment = require('moment');

router.post('/email/send', (req, res, next) => {
  MailConfig.ViewOption(gmailTransport, hbs);
  let HelperOptions = {
    from: '"Shaw Services" <app.shawservices@gmail.com>',
    to: req.body.toAddress,
    subject: req.body.subject,
    template: 'mailbody',
    context: req.body.context
  };
  gmailTransport.sendMail(HelperOptions, (error, info) => {
    if (error) {
      res.json(error);
    }
    console.log("email is send");
    console.log(info);
    res.json(info)
  });
});

router.post('/email/smtp/send', (req, res, next) => {
  MailConfig.ViewOption(smtpTransport, hbs);

  const pdfDoc = new HummusRecipe(__dirname + '/PDPA_Policy.pdf', __dirname + '/PDPA_Policy_Edited.pdf');

  // var today = new Date();  
  // var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  // var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  // var name = "Myat Min";

  pdfDoc
    .editPage(5)
    .text(req.body.context.name.toUpperCase(), 105, 557, {
      color: '#000000',
      bold: true,
      font: 'Helvatica',
      size: 10
      // opacity: 0.8
    })
    .text("[" + moment().format("Do MMMM YYYY") + "]", 153, 606, {
      color: '#000000',
      bold: true,
      font: 'Helvatica',
      size: 10
      // opacity: 0.8
    })
    .endPage()
    .endPDF();

  var attachments = [
    {
      filename: 'PDPA_Policy.pdf',
      path: __dirname + '/PDPA_Policy_Edited.pdf',
      contentType: 'application/pdf',
      cid: 'uniq-PDPA.pdf'
    }
  ];
  let HelperOptions = {
    from: '"Shaw Services" <test@shaw.com.sg>',
    to: req.body.toAddress,
    subject: req.body.subject,
    // html: '<p> Dear{{name}},</p>{{{body}}}<hr><p style="font-size: 80%;">{{{disclaimer}}}</p>',
    template: 'mailbody',
    context: req.body.context,
    attachments: attachments
  };

  smtpTransport.options.secure = (smtpTransport.options.secure === 'true' ? true : false);
  smtpTransport.transporter.options.secure = (smtpTransport.transporter.options.secure === 'true' ? true : false);

  smtpTransport.verify((error, success) => {
    if (error) {
      res.json({ output: 'error', message: error })
      res.end();
    } else {
      smtpTransport.sendMail(HelperOptions, (error, info) => {
        if (error) {
          res.json({ output: 'error', message: error })
        }
        res.json({ output: 'success', message: info });
        res.end();
      });
    }
  });
});

module.exports = router;

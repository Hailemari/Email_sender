const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
require('dotenv').config();
const fs = require('fs').promises;
const cheerio = require('cheerio');
const PORT = process.env.PORT || 3000
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));


const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

app.post('/cancel_subscription', async (req, res) => {
  console.log('new request for', req.body.user_email);
  try {
    const { user_email, subscription_id, product_name, created_at } = req.body;
    if (!user_email || !subscription_id || !product_name || !created_at) {
      return res.status(400).json({ error: 'Missing required fields in the request.' });
    }
    const { subject, body } = getEmailContent(product_name, subscription_id, created_at);
    await sendEmail(user_email, subject, body);
    console.log('Email sent to customer for subscription cancellation.');
    res.status(200).json({ message: 'Email sent to customer for subscription cancellation.' });
  } catch (error) {
    console.error("Failed to process request:", error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

async function getEmailContent(product_name, subscription_id, created_at) {
  const cancellationTime = new Date();
  const creationTime = new Date(created_at);
  const differenceInMs = cancellationTime.getTime() - creationTime.getTime();
  const differenceInDays = Math.floor(differenceInMs / (1000 * 60 * 60 * 24));
  let emailSubject = '';
  let htmlContent = '';
  try {
    let data = '';
    if (differenceInDays < 7) {
      data = await fs.readFile('message_one.html', 'utf8');
    } else if (differenceInDays < 30) {
      data = await fs.readFile('message_two.html', 'utf8');
    } else {
      data = await fs.readFile('message_three.html', 'utf8');
    }
    const $ = cheerio.load(data);
    emailSubject = $('title').text();
    $('title').remove();
    htmlContent = $.html();
  } catch (err) {
    console.error('An error occurred:', err);
    throw err;
  }
  return { subject: emailSubject, body: htmlContent };
}

async function sendEmail(receiverEmail, subject, message) {
  try {
    let mailOptions = {
      from: process.env.EMAIL_FROM,
      to: receiverEmail,
      subject: subject,
      html: message
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error('Failed to send email: ' + error.message);
  }
}

app.listen(PORT, () => {
  console.log(`APP LISTENING ON PORT ${PORT}`)
})
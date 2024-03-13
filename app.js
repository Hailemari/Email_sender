const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
require('dotenv').config();

const fs = require('fs');
const marked = require('marked');


const PORT = process.env.PORT || 3000

const app = express();


app.use(bodyParser.urlencoded({ extended: false }));


app.post('/cancel_subscription', async (req, res) => {
    console.log('new request');
    console.log(req.body);

    try {
        const { user_email, subscription_id, product_name, created_at } = req.body;

        if (!user_email || !subscription_id || !product_name || !created_at) {
            return res.status(400).json({ error: 'Missing required fields in the request.' });
        }

        const emailContent = getEmailContent(product_name, subscription_id, created_at);
        

        await sendEmail(user_email, "Get Support & Claim Refund for your Bulk Mockup subscription?", emailContent);
        
        res.status(200).json({ message: 'Email sent to customer for subscription cancellation.' });
    } catch (error) {
        console.error("Failed to process request:", error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

function getEmailContent(product_name, subscription_id, created_at) {
    const cancellationTime = new Date();
    const creationTime = new Date(created_at);

    const differenceInMs = cancellationTime.getTime() - creationTime.getTime();
    const differenceInDays = Math.floor(differenceInMs / (1000 * 60 * 60 * 24));
    console.log(cancellationTime.getTime());
    console.log(creationTime.getTime());
    console.log(differenceInDays);

    let htmlContent = `<html><body><p>Subscription Cancelled!</p></body></html>`
  
    if (differenceInDays < 7) {
        fs.readFile('message_one.txt', 'utf8', (err, data) => {
            if (err) {
                console.error('An error occurred:', err);
                return;
            }
            htmlContent = marked(data);
        })
        
    } else if (differenceInDays < 30) {
        fs.readFile('message_two.txt', 'utf8', (err, data) => {
            if (err) {
                console.error('An error occured', err);
                return;
            }
            htmlContent = marked(data);
        })
    } else {
        fs.readFile('message_three.txt', 'utf8', (err, data) => {
            if (err) {
                console.error('An error occured', err);
                return;
            }
            htmlContent = marked(data); 
        })
    }

    return htmlContent;

}

async function sendEmail(receiverEmail, subject, message) {
    try {
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            },
        });

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
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
require('dotenv').config();

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
        htmlContent = `
            <html>
            <body>
                <p>Hello {{ subscriber.first_name }},</p>
                <p>I am Vikash, the creator of Bulk Mockup.</p>
                <p>I noticed that you recently canceled your subscription within the first 7 days. Your satisfaction is our top priority.</p>
                <p>I'd like to offer our quick support assistance to make sure you get the most out of it.</p>
                <p>Would you be interested in scheduling a one-on-one support call at a time that suits you best?</p>
                <p>During this call, I can address any concerns you may have, help you navigate and setup your workflow, and ensure you're getting the value you signed up for.</p>
                <p><a href="https://cal.com/vikash-bulk-mockup/30min">Book a support call here</a></p>
                <p>Best Regards</p>
                <p>Vikash Kr. Prajapati</p>
                <p>Founder Bulk Mockup</p>
                <p>P.S. You are protected by our 7-day money-back guarantee. If you'd like to claim your refund, kindly <a href="https://forms.gle/1vKddypt6fTRFNmx6">fill up this form</a>.</p>
            </body>
            </html>
        `;
    } else if (differenceInDays < 30) {
        htmlContent = `
            <html>
            <body>
                <p>Hello {{ subscriber.first_name }},</p>
                <p>I am Vikash, the creator of Bulk Mockup.</p>
                <p>I noticed that you recently canceled your subscription within the first 7 days. Your satisfaction is our top priority.</p>
                <p>I'd like to offer our quick support assistance to make sure you get the most out of it.</p>
                <p>Would you be interested in scheduling a one-on-one support call at a time that suits you best?</p>
                <p>During this call, I can address any concerns you may have, help you navigate and setup your workflow, and ensure you're getting the value you signed up for.</p>
                <p><a href="https://cal.com/vikash-bulk-mockup/30min">Book a support call here</a></p>
                <p>Best Regards</p>
                <p>Vikash Kr. Prajapati</p>
                <p>Founder Bulk Mockup</p>
                <p>P.S. You are protected by our 7-day money-back guarantee. If you'd like to claim your refund, kindly <a href="https://forms.gle/1vKddypt6fTRFNmx6">fill up this form</a>.</p>
            </body>
            </html>
        `;
    } else {
        htmlContent = `
            <html>
            <body>
                <p>Hello {{ subscriber.first_name }},</p>
                <p>I am Vikash, the creator of Bulk Mockup.</p>
                <p>I noticed that you recently canceled your subscription within the first 7 days. Your satisfaction is our top priority.</p>
                <p>I'd like to offer our quick support assistance to make sure you get the most out of it.</p>
                <p>Would you be interested in scheduling a one-on-one support call at a time that suits you best?</p>
                <p>During this call, I can address any concerns you may have, help you navigate and setup your workflow, and ensure you're getting the value you signed up for.</p>
                <p><a href="https://cal.com/vikash-bulk-mockup/30min">Book a support call here</a></p>
                <p>Best Regards</p>
                <p>Vikash Kr. Prajapati</p>
                <p>Founder Bulk Mockup</p>
                <p>P.S. You are protected by our 7-day money-back guarantee. If you'd like to claim your refund, kindly <a href="https://forms.gle/1vKddypt6fTRFNmx6">fill up this form</a>.</p>
            </body>
            </html>
        `;
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
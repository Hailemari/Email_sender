const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
require('dotenv').config();

const PORT = process.env.PORT || 3000

const app = express();


app.use(bodyParser.json())


app.post('/cancel_subscription', async (req, res) => {
    console.log('new request');
    console.log(req.body);

    try {
        const { user_email, subscription_id, product_name, ended_at, created_at } = req.body;

        if (!user_email || !subscription_id || !product_name || !ended_at || !created_at) {
            return res.status(400).json({ error: 'Missing required fields in the request.' });
        }

        const emailContent = getEmailContent(product_name, subscription_id, ended_at, created_at);
        

        await sendEmail(user_email, "Subscription Cancellation", emailContent);
        
        res.status(200).json({ message: 'Email sent to customer for subscription cancellation.' });
    } catch (error) {
        console.error("Failed to process request:", error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

function getEmailContent(product_name, subscription_id, ended_at, created_at) {
    const cancellationTime = new Date(ended_at);
    const creationTime = new Date(created_at);

    const differenceInMs = cancellationTime.getTime() - creationTime.getTime();
    const differenceInDays = Math.floor(differenceInMs / (1000 * 60 * 60 * 24));
    console.log(cancellationTime.getTime());
    console.log(creationTime.getTime());
    console.log(differenceInDays);
    if (differenceInDays < 7) {
        return `Dear Customer,\n\nYour subscription for ${product_name} (Subscription ID: ${subscription_id}) has been cancelled within the first seven days of subscription.\n\nIf you have any questions or concerns, please feel free to contact us.\n\nBest regards,\n`;
    } else if (differenceInDays < 30) {
        return `Dear Customer,\n\nYour subscription for ${product_name} (Subscription ID: ${subscription_id}) has been cancelled between 7 and 30 days of subscription.\n\nIf you have any  questions or concerns, please feel free to contact us.\n\nBest regards,\n`;
    } else {
        return `Dear Customer,\n\nYour subscription for ${product_name} (Subscription ID: ${subscription_id}) has been cancelled after 30 days of subscription.\n\nIf you have any questions or concerns, please feel free to contact us.\n\nBest regards,\n`;
    }
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
            text: message
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        throw new Error('Failed to send email: ' + error.message);
    }
}

app.listen(PORT, () => {
    console.log(`APP LISTENING ON PORT ${PORT}`)
})
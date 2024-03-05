const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer')

const app = express()
const PORT = process.env.PORT || 3000

app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.send('HELLO WORLD');
});

app.post('/cancel_subscription', (req, res) => {
    const { user_email, subscription_id, product_name, cancelled_at } = req.body;

    let emailContent;
    const cancellationTime = new Date(cancelled_at);
    const currentTime = new Date();
    const daysDifference = Math.floor((currentTime - cancellationTime) / (1000 * 60 * 60 * 24));


    if (daysDifference < 7) {
        emailContent = `Dear Customer,\n\nYour subscription for ${product_name} (Subscription ID: ${subscription_id}) has been cancelled within the first seven days of subscription.\n\nIf you have any questions or concerns, please feel free to contact us.\n\nBest regards,\nYour Company`;
    } else if (daysDifference < 30) {
        emailContent = `Dear Customer,\n\nYour subscription for ${product_name} (Subscription ID: ${subscription_id}) has been cancelled between 7 and 30 days of subscription.\n\nIf you have any questions or concerns, please feel free to contact us.\n\nBest regards,\nYour Company`;
    } else {
        emailContent = `Dear Customer,\n\nYour subscription for ${product_name} (Subscription ID: ${subscription_id}) has been cancelled after 30 days of subscription.\n\nIf you have any questions or concerns, please feel free to contact us.\n\nBest regards,\nYour Company`;
    }

   
    sendEmail(user_email, "Subscription Cancellation", emailContent)
        .then(() => {
            console.log("Email sent successfully!");
            res.status(200).json({ message: 'Email sent to customer for subscription cancellation.' });
        })
        .catch((error) => {
            console.error("Failed to send email:", error);
            res.status(500).json({ error: 'Failed to send email.' });
        });
});


async function sendEmail(receiverEmail, subject, message) {
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: "hailemariamkefale19@gmail.com",
            pass: "hailemariam@19"
        },
    });


    let mailOptions = {
        from: 'hailemariamkefale19@gmail.com',
        to: receiverEmail,
        subject: subject,
        text: message
    };

    
    await transporter.sendMail(mailOptions);
}


app.listen(PORT, () => {
    console.log(`Server is running on 'http://localhost:${PORT}'`);
});
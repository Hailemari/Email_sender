const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
require('dotenv').config();

const fs = require('fs').promises;
const { google } = require('googleapis');


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

        const {subject, body } = getEmailContent(product_name, subscription_id, created_at);
        

        await sendEmail(user_email, subject, body);
        
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
  
    try {
      const auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(await fs.readFile('./clientInfo.json')),
        scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
        subject: 'hailemariamkefale19@gmail.com'
      });
  
      const gmail = google.gmail({ version: 'v1', auth });
  
      const drafts = await gmail.users.drafts.list({
        userId: 'me',
      });
  
      const draftId = getDraftId(differenceInDays, drafts.data.drafts);
      if (!draftId) {
        throw new Error('No matching draft found for the given criteria.');
      }
  
      const draft = await gmail.users.drafts.get({
        userId: 'me',
        id: draftId,
      });
  
      const decoder = new TextDecoder('utf-8');
      const emailSubject = draft.data.message.subject;
      const htmlContent = decoder.decode(Buffer.from(draft.data.message.payload.body.data, 'base64'));
      
      console.log('Email subject:', emailSubject);
      console.log('Email body:', htmlContent);
      return { subject: emailSubject, body: htmlContent };
      
    } catch (error) {
        console.error('Error fetching email content:', error);
        throw error;
    }
      
  }
  
  function getDraftId(differenceInDays, drafts) {
    // Implement logic to retrieve the appropriate draft ID based on differenceInDays
    // This could involve storing draft IDs in a database or a configuration file
    // For simplicity, this example returns the first draft ID that matches the criteria
    if (differenceInDays < 7) {
      const match = drafts.find((draft) => draft.message.subject.includes('Draft 1'));
      return match ? match.id : null;
    } else if (differenceInDays < 30) {
      const match = drafts.find((draft) => draft.message.subject.includes('Draft 2'));
      return match ? match.id : null;
    } else {
      const match = drafts.find((draft) => draft.message.subject.includes('Draft 3'));
      return match ? match.id : null;
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

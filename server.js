// Optional Backend Server for Email Handling
// Use this for production to keep API keys secure

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));

// Email Configuration
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Send Email Endpoint
app.post('/api/send-email', async (req, res) => {
    try {
        const { to, subject, htmlContent, pdfBase64, fileName } = req.body;

        if (!to || !subject || !htmlContent) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const attachments = [];
        if (pdfBase64 && fileName) {
            attachments.push({
                filename: fileName,
                content: Buffer.from(pdfBase64, 'base64'),
                contentType: 'application/pdf'
            });
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: to,
            subject: subject,
            html: htmlContent,
            attachments: attachments
        };

        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
        console.error('Email sending error:', error);
        res.status(500).json({ error: 'Failed to send email', details: error.message });
    }
});

// Verify Connection
app.post('/api/test-email', async (req, res) => {
    try {
        await transporter.verify();
        res.json({ success: true, message: 'Email service is working' });
    } catch (error) {
        res.status(500).json({ error: 'Email service is not working', details: error.message });
    }
});

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running' });
});

app.listen(PORT, () => {
    console.log(`Booking System Server running on port ${PORT}`);
});

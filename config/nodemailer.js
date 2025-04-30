// Import the nodemailer library for sending emails
import nodemailer from 'nodemailer';

// Import the email password from our environment variables
import { EMAIL_PASSWORD } from './env.js'

// Define the email account that will be used to send emails
export const accountEmail = "surajadhikari055@gmail.com";

// Create a nodemailer transporter instance configured for Gmail
// The transporter will be used to send emails throughout the application
const transporter = nodemailer.createTransport({
    // Specify the email service (Gmail in this case)
    service: "gmail",

    // Authentication configuration
    auth: {
        user: accountEmail,         // Email address that will send the messages
        pass: EMAIL_PASSWORD        // App password or account password
    }
});

export default transporter;
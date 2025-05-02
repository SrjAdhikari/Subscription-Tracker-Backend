// Import email templates for different reminder types
import { emailTemplates } from './email-template.js';

// Import date manipulation library
import dayjs from 'dayjs';

// Import email transporter configuration and sender account
import transporter, { accountEmail } from '../config/nodemailer.js';


// Sends a reminder email to a user based on the subscription's renewal schedule
export const sendReminderEmail = async ({ to, type, subscription }) => {
    // Validate required parameters
    if(!to || !type) 
        throw new Error('Missing required parameters');

    // Find the appropriate email template
    const template = emailTemplates.find((t) => t.label === type);

    // Check if matching template is found
    if(!template) 
        throw new Error('Invalid email type');

    // Prepare email content data
    const mailInfo = {
        userName: subscription.user.name,
        subscriptionName: subscription.name,
        renewalDate: dayjs(subscription.renewalDate).format('MMM D, YYYY'),
        planName: subscription.name,
        price: `${subscription.currency} ${subscription.price} (${subscription.frequency})`,
        paymentMethod: subscription.paymentMethod,
    }

    // Generate email body and subject using the selected template
    const message = template.generateBody(mailInfo);
    const subject = template.generateSubject(mailInfo);

    // Define the mail options for Nodemailer
    const mailOptions = {
        from: accountEmail,         // Sender email address
        to: to,                     // Recipient email address
        subject: subject,           // Subject line
        html: message,              // Email body in HTML format
    }

    // Send the email using the transporter
    transporter.sendMail(mailOptions, (error, info) => {
        if(error) 
            // Log any errors that occur during sending
            return console.log(error, 'Error sending email');

        // Log confirmation if email was sent successfully
        console.log('Email sent: ' + info.response);
    });
}
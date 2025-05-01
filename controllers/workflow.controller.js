// Importing dayjs for date manipulation
import dayjs from "dayjs";

// Used for CommonJS module import inside an ES module
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { serve } = require("@upstash/workflow/express");

// Importing the Subscription model and email utility
import Subscription from "../models/subscription.model.js";
import { sendReminderEmail } from "../utils/send-email.js";


// Constants defining days before renewal to send reminders
const REMINDERS = [7, 5, 2, 1];


// Entry point for the Upstash Workflow function to send reminders
export const sendReminders = serve( async (context) => {
    // Extract subscription ID from workflow payload
    const { subscriptionId } = context.requestPayload;

    // Fetch subscription with user details
    const subscription = await fetchSubscription(context, subscriptionId);

    // Validate subscription status
    if(!subscription || subscription.status !== "active") return;

    // Parse renewal date
    const renewalDate = dayjs(subscription.renewalDate);

    // Check if renewal date has passed
    if(renewalDate.isBefore(dayjs())) {
        console.log(`Renewal date has passed for subscription ${subscriptionId}. Stopping workflow.`);
        return;
    }

    // Process each reminder day (7, 5, 2, 1)
    for(const daysBefore of REMINDERS) {
        // Calculate the exact reminder date
        const reminderDate = renewalDate.subtract(daysBefore, "day");

        // If the reminder date is in the future, schedule a sleep
        if(reminderDate.isAfter(dayjs())) {
            await sleepUntilReminder(context, `${daysBefore} days before reminder`, reminderDate);
        }

        // If the current date matches the reminder date, trigger the email reminder
        if(dayjs().isSame(reminderDate, "day")) {
            await triggerReminder(context, `Reminder ${daysBefore} days before`, subscription);
        }
    }
});


// Function to fetch subscription from DB with user populated
const fetchSubscription = async (context, subscriptionId) => {
    return await context.run("get subscription", async () => {
        return await Subscription.findById(subscriptionId).populate("user", "name email");
    });
}

// Function to pause workflow execution until a specific date/time
const sleepUntilReminder = async (context, label, date) => {
    console.log(`Sleeping until ${label} reminder at ${date}`);
    await context.sleepUntil(label, date.toDate());
}

// Function to send reminder email to the user
const triggerReminder = async (context, label, subscription) => {
    return await context.run(label, async () => {
        console.log(`Triggering ${label} reminder`);

        await sendReminderEmail({
            to: subscription.user.email,
            type: label,
            subscription,
        });
    });
}
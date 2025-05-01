import mongoose from "mongoose";


// Define the schema for a Subscription document
const subscriptionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Subscription name is required"],
        trim: true,
        minLength: 3,
        maxLength: 100,
    },
    price: {
        type: Number,
        required: [true, "Subscription price is required"],
        min: [0, "Price must be greater than 0"],
    },
    currency: {
        type: String,
        enum: ["USD", "JPY", "EUR"],
        default: "USD",
    },
    frequency: {
        type: String,
        enum: ["daily", "weekly", "monthly", "yearly"],
    },
    category: {
        type: String,
        enum: ["sports", "news", "entertainment", "lifestyle", "technology", "finance", "other"],
        required: true,
    },
    paymentMethod: {
        type: String,
        required: true,
        trim: true,
    },
    status: {
        type: String,
        enum: ["active", "cancelled", "expired"],
        default: "active",
    },
    startDate: {
        type: Date,
        required: true,
        validate: {
            validator: (value) => {
                return value <= new Date;
            },
            message: "Start date must be the past",
        }
    },
    renewalDate: {
        type: Date,
        validate: {
            validator: function (value) {
                return value > this.startDate;
            },
            message: "Renewal date must be after the start date",
        }
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    }
}, {timestamps: true});


//* =============================================
//* 🔁 PRE-SAVE HOOK TO HANDLE RENEWAL LOGIC
//* =============================================

// This hook runs automatically before the subscription document is saved
subscriptionSchema.pre("save", function (next) {
    // Auto-calculate renewalDate if it's not set
    if(!this.renewalDate) {
        const renewalPeriods = {
            daily: 1,
            weekly: 7,
            monthly: 30,
            yearly: 365,
        };

        // Clone startDate to avoid mutating the original date
        this.renewalDate = new Date(this.startDate);

        // Add appropriate days to the start date based on frequency
        this.renewalDate.setDate(this.renewalDate.getDate() + renewalPeriods[this.frequency]);
    }

    // If the calculated renewal date is already in the past, mark as expired
    if(this.renewalDate < new Date()) {
        this.status = "expired";
    }

    // Call next() to continue saving the document
    next();
});

// Create the Mongoose model from the schema
const subscription = mongoose.model(
    "Subscription", 
    subscriptionSchema
);

export default subscription;
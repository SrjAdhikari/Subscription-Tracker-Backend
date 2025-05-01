import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, "User name is required"],
        trim: true,
        minLength: 3,
        maxLength: 50,
    },
    email: {
        type: String,
        required: [true, "User Email is required"],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, "Please fill a valid email address"],
    },
    password: {
        type: String,
        required: [true, "User passwors is required"],
        minLength: 6,
    }
}, {timestamps: true});

const User = mongoose.model("User", userSchema);

export default User;
import User from "../models/user.model.js";


//* ====================================
//* ✅ CONTROLLER TO FETCH ALL USERS
//* ====================================

export const getUsers = async (req, res, next) => {
    try {
        // Fetch all users from the database
        const users = await User.find();

        // Send successful response with users data
        res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        // Pass error to error handling middleware
        next(error);
    }
};


//* ====================================
//* ✅ CONTROLLER TO FETCH SINGLE USER
//* ====================================

export const getUser = async (req, res, next) => {
    try {
        // Extract user ID from URL parameters
        const id = req.params.id;

        // Find user by ID and exclude the password field
        const user = await User.findById(id).select("-password");

        // Handle case where user isn't found
        if(!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        // Send successful response with user data
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        // Pass error to error handling middleware
        next(error);
    }
};


//* ====================================
//* ✅ CONTROLLER TO CREATE NEW USER
//* ====================================

export const createUser = async (req, res, next ) => {
    try {
        // Extract user data from request body
        const { name, email, password } = req.body;
        
        // Check if a user with the provided email already exists
        const existingUser = await User.findOne({ email });

        // If user exists, throw a conflict error (HTTP 409)
        if(existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already registered",
            });
        }

        // Generate a salt for password hashing
        const salt = await bcrypt.genSalt(10);

        // Hash the password using the generated salt
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user in the database
        const newuser = await User.create({
            name,
            email,
            password: hashedPassword
        });

        // Send success response
        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: {
                user: newuser[0]
            }
        });

    } catch (error) {
        // Pass error to error handling middleware
        next(error);
    }
};


//* ====================================
//* ✅ CONTROLLER TO UPDATE USER
//* ====================================

export const updateUser = async (req, res, next) => {
    try {
        // Destructure request body
        const { _id, ...updateInfo} = req.body;

        // Validate required fields
        if(!_id) { 
            return res.status(400).json({
                success: false,
                message: "User ID is required",
            });
        }

        // Find and update user
        const updatedUser = await User.findByIdAndUpdate(
            _id,
            updateInfo,
            { 
                runValidators: true,    // Run schema validators on update
                new: true               // Return the updated document
            }
        );

        // Handle user not found
        if(!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Send success response with updated user data
        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: updatedUser,
        });
    } catch (error) {
        // Pass error to error handling middleware
        next(error);
    }
};


//* ====================================
//* ✅ CONTROLLER TO DELETE USER
//* ====================================

export const deleteUser = async (req, res, next) => {
    try {
        // Extract user ID from request parameters
        const id = req.params.id;

        // Find and delete the user by ID
        const deletedUser = await User.findByIdAndDelete(id);

        // Handle user not found
        if(!deletedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Return success response
        res.status(200).json({
            success: true,
            message: "User deleted successfully",
            data: {
                deletedUserId: deletedUser._id,
                email: deleteUser.email
            }
        });

    } catch (error) {
        // Pass error to error handling middleware
        next(error);
    }
};
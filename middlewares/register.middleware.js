// Import validator library for email and password validation
import validator from "validator";

//* =============================================
//* 🛡️ VALIDATION CONFIGURATION (Constants)
//* =============================================

// Define password strength requirements
const PASSWORD_STRENGTH = {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1
}

// Regular expression to validate names
// Allows letters, spaces, apostrophes ('), and hyphens (-)
const NAME_REGEX = /^[a-zA-Z\s'-]+$/;


//* =============================================
//* ✅ MIDDLEWARE TO VALIDATE REGISTRATION DATA
//* =============================================

const register = (req, res, next) => {
    const { name, email, password } = req.body;

    //* 🛡️ Check for required fields
    if(!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Please provide name, email, and password",
        });
    }

    //* 📛 Name Length Validation
    if(name.length < 3 || name.length > 50) {
        return res.status(400).json({
            success: false,
            message: "Name must be between 3 and 50 characters."
        });
    }

    //* 📛 Name Character Validation
    if(!NAME_REGEX.test(name)) {
        return res.status(400).json({
            success: false,
            message: "Name can only contain letters, spaces, hyphens, and apostrophes",
        });
    }

    //* 📧 Email Format Validation using validator.js
    if(!validator.isEmail(email)) {
        return res.status(400).json({
            success: false,
            message: "Invalid email format."
        });
    }

    //* 🔑 Password Strength Validation using validator.js
    if(!validator.isStrongPassword(password, PASSWORD_STRENGTH)) {
        return res.status(400).json({
            success: false,
            message: `Password must contain at least 8 characters 
                    with 1 uppercase, 1 lowercase, 1 number, and 1 symbol`
        });
    }

    // If all validations pass, proceed to the next middleware/controller
    next();
};

export default register;
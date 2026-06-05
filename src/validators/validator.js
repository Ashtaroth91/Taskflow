import { body } from "express-validator";

export const registerValidationRules = () => {
    return [
        body("username")
            .trim()
            .notEmpty().withMessage("Username is required")
            .isLength({ min: 5 }).withMessage("Username must be at least 5 characters long")
            .isLowercase().withMessage("Username must be in lowercase"),
        body("email")
            .trim()
            .notEmpty().withMessage("Email is required")
            .isEmail().withMessage("Invalid email format"),
        body("password")
            .trim()
            .notEmpty().withMessage("Password is required")
            .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long")
    ];
};

export const loginValidationRules = () => { 
    return [
        body("username")
            .optional()
            .trim()
            .isLength({ min: 5 }).withMessage("Username must be at least 5 characters long")
            .isLowercase().withMessage("Username must be in lowercase"),
        body("email")
            .optional()
            .trim()
            .isEmail().withMessage("Invalid email format"),
        body("password")
            .trim()
            .notEmpty().withMessage("Password is required")
    ];
};
import { body } from "express-validator";
import { AvailableUserRoles } from "../utils/constants.js";

export const registerValidationRules = () => {
    return [
        body("username")
            .trim()
            .notEmpty()
            .withMessage("Username is required")
            .isLength({ min: 5 })
            .withMessage("Username must be at least 5 characters long")
            .toLowerCase(),
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Invalid email format"),
        body("password")
            .trim()
            .notEmpty()
            .withMessage("Password is required")
            .isLength({ min: 8 })
            .withMessage("Password must be at least 8 characters long"),
    ];
};

export const loginValidationRules = () => {
    return [
        body("username")
            .optional()
            .trim()
            .isLength({ min: 5 })
            .withMessage("Username must be at least 5 characters long")
            .isLowercase()
            .withMessage("Username must be in lowercase"),
        body("email")
            .optional()
            .trim()
            .isEmail()
            .withMessage("Invalid email format"),
        body("password").trim().notEmpty().withMessage("Password is required"),
    ];
};

export const forgotPasswordValidationRules = () => {
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Invalid email format"),
    ];
};

export const resetPasswordValidationRules = () => {
    return [
        body("newPassword")
            .trim()
            .notEmpty()
            .withMessage("Password is required")
            .isLength({ min: 8 })
            .withMessage("Password must be at least 8 characters long"),
        body("confirmNewPassword")
            .notEmpty()
            .withMessage("Confirm new password is required")
            .custom((value, { req }) => {
                if (value !== req.body.newPassword) {
                    throw new Error("Passwords do not match");
                }
                return true;
            }),
    ];
};

export const changePasswordValidationRules = () => {
    return [
        body("oldPassword")
            .trim()
            .notEmpty()
            .withMessage("Old password is required"),
        body("newPassword")
            .trim()
            .notEmpty()
            .withMessage("New password is required")
            .isLength({ min: 8 })
            .withMessage("Password must be at least 8 characters long"),
        body("confirmNewPassword")
            .notEmpty()
            .withMessage("Confirm new password is required")
            .custom((value, { req }) => {
                if (value !== req.body.newPassword) {
                    throw new Error("Passwords do not match");
                }
                return true;
            }),
    ];
};

export const createProjectRules = () => {
    return [
        body("name")
            .trim()
            .notEmpty()
            .withMessage("Project name required!!!")
            .isLength({ min: 5 }),
        body("description")
            .trim()
            .notEmpty()
            .withMessage("Project description required")
            .isLength({ min: 20 }),
    ];
};

export const addMembertoProjectRules = () => {
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required!!!")
            .isEmail()
            .withMessage("Invalid email format!!!"),
        body("role")
            .notEmpty()
            .withMessage("Role is required!!!")
            .isIn(AvailableUserRoles)
            .withMessage("Role is invalid!!!"),
    ];
};

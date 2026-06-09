import { Router } from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    currentUser,
    verifyEmail,
    resendVerificationEmail,
    refreshAccessToken,
    forgotPassword,
    changePassword,
    resetPassword,
} from "../controllers/auth.controller.js";
import {
    registerValidationRules,
    loginValidationRules,
    forgotPasswordValidationRules,
    resetPasswordValidationRules,
    changePasswordValidationRules,
} from "../validators/validator.js";
import { validate } from "../middlewares/validator.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

//Public routes
router
    .route("/register")
    .post(registerValidationRules(), validate, registerUser);

router.route("/login").post(loginValidationRules(), validate, loginUser);

router.route("/verify-email/:verificationToken").get(verifyEmail);

router.route("/refresh-token").post(refreshAccessToken);

router
    .route("/reset-password/:resetToken")
    .post(resetPasswordValidationRules(), validate, resetPassword);

router
    .route("/forgot-password")
    .post(forgotPasswordValidationRules(), validate, forgotPassword);

//Secured route
router.route("/logout").post(verifyJWT, logoutUser);

router.route("/current-user").get(verifyJWT, currentUser);

router
    .route("/resend-email-verification")
    .post(verifyJWT, resendVerificationEmail);

router
    .route("/change-password")
    .post(verifyJWT, changePasswordValidationRules(), validate, changePassword);

export default router;
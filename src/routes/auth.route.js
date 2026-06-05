import {Router} from "express";
import { registerUser, loginUser} from "../controllers/auth.controller.js";
import { registerValidationRules, loginValidationRules } from "../validators/validator.js";
import { validate } from "../middlewares/validator.middleware.js";

const router = Router();

router.route("/register").post(registerValidationRules(), validate, registerUser);
router.route("/login").post(loginValidationRules(), validate, loginUser);
// router.route("/verify-email").get(verifyEmail);

export default router;
import { User } from "../models/user.model.js";
import { Note } from "../models/notes.model.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import {
    sendEmail,
    emailVerificationTemplate,
    forgotPasswordTemplate,
} from "../utils/mail.js";

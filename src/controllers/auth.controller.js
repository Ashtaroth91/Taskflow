import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import {
    sendEmail,
    emailVerificationTemplate,
    forgotPasswordTemplate,
} from "../utils/mail.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const getAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found", []);
        }
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Failed to generate tokens", [error.message]);
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({
        $or: [{ email }, { username }],
    });
    if (existingUser) {
        throw new ApiError(
            409,
            "User with this email or username already exists",
            [],
        );
    }
    const user = await User.create({
        username,
        email,
        password,
        isEmailVerified: false,
    });
    const { unHashedToken, hashedToken, tokenExpiry } =
        user.generateTemporaryToken();
    user.emailVerificationToken = hashedToken;
    user.emailVerificationTokenExpiry = tokenExpiry;
    await user.save({ validateBeforeSave: false });

    await sendEmail({
        mail: user?.email,
        subject: "Verify your email for TaskFlow",
        mailgenContent: emailVerificationTemplate(
            user.username,
            `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unHashedToken}`,
        ),
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken",
    );
    return res.status(201).json(
        new ApiResponse(
            201,
            {
                user: createdUser,
            },
            "User registered successfully. Please check your email to verify your account.",
        ),
    );
});

const loginUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    if (!(username || email)) {
        throw new ApiError(400, "Username or email is required", []);
    }
    const user = await User.findOne({ $or: [{ username }, { email }] }).select(
        "+password +isEmailVerified",
    );
    if (!user) {
        throw new ApiError(401, "Invalid credentials", []);
    }
    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid credentials", []);
    }
    if (!user.isEmailVerified) {
        throw new ApiError(
            403,
            "Email not verified. Please verify your email before logging in.",
            [],
        );
    }
    const { accessToken, refreshToken } = await getAccessAndRefreshTokens(
        user._id,
    );

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry",
    );

    const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                },
                "User logged in successfully",
            ),
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1,
            },
        },
        {
            new: true,
        },
    );
    const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
    };
    return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(new ApiResponse(200, null, "User logged out successfully"));
});

const currentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(200, req.user, "Current user fetched successfully"),
        );
});

const verifyEmail = asyncHandler(async (req, res) => {
    const { verificationToken } = req.params;
    if (!verificationToken) {
        throw new ApiError(400, "Email verification token not found");
    }
    const hashedToken = crypto
        .createHash("sha256")
        .update(verificationToken)
        .digest("hex");

    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationTokenExpiry: { $gt: Date.now() },
    });
    if (!user) {
        throw new ApiError(400, "Token is either invalid or expired");
    }
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpiry = undefined;
    user.isEmailVerified = true;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                user: {
                    isEmailVerified: true,
                },
            },
            "Email verified successfully",
        ),
    );
});

const resendVerificationEmail = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user?._id);
    if (!user) {
        throw new ApiError(404, "User does not exist");
    }
    if (user.isEmailVerified) {
        throw new ApiError(409, "Email is already verified");
    }
    const { unHashedToken, hashedToken, tokenExpiry } =
        user.generateTemporaryToken();
    user.emailVerificationToken = hashedToken;
    user.emailVerificationTokenExpiry = tokenExpiry;
    await user.save({ validateBeforeSave: false });

    await sendEmail({
        mail: user?.email,
        subject: "Verify your email for TaskFlow",
        mailgenContent: emailVerificationTemplate(
            user.username,
            `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unHashedToken}`,
        ),
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                email: user.email,
            },
            "Verification email sent successfully",
        ),
    );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized access");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET,
        );
        const user = await User.findById(decodedToken?._id).select(
            "+refreshToken",
        );
        if (!user) {
            throw new ApiError(401, "Invalid Refresh Token");
        }
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh Token Expired");
        }
        const cookieOptions = {
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        };
        const { accessToken, refreshToken } = await getAccessAndRefreshTokens(
            user?._id,
        );

        return res
            .status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", refreshToken, cookieOptions)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken,
                    },
                    "Access Token refreshed",
                ),
            );
    } catch (err) {
        if (error instanceof jwt.JsonWebTokenError) {
            throw new ApiError(401, "Invalid Refresh Token");
        }

        if (error instanceof jwt.TokenExpiredError) {
            throw new ApiError(401, "Refresh Token Expired");
        }

        throw error;
    }
});

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    null,
                    "If an account exists, a reset email has been sent.",
                ),
            );
    }
    const { unHashedToken, hashedToken, tokenExpiry } =
        user.generateTemporaryToken();
    user.forgotPasswordToken = hashedToken;
    user.forgotPasswordTokenExpiry = tokenExpiry;
    await user.save({ validateBeforeSave: false });

    await sendEmail({
        mail: user?.email,
        subject: "Reset password for your TaskFlow account",
        mailgenContent: forgotPasswordTemplate(
            user.username,
            `${req.protocol}://${req.get("host")}/api/v1/auth/reset-password/${unHashedToken}`,
        ),
    });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                null,
                "If an account exists, a reset email has been sent",
            ),
        );
});

const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "Old password and new password are required");
    }
    const user = await User.findById(req.user._id).select("+password");
    const isPasswordValid = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordValid) {
        throw new ApiError(400, "Invalid credentials");
    }
    const isSamePassword = await user.isPasswordCorrect(newPassword);
    if (isSamePassword) {
        throw new ApiError(
            400,
            "New password must be different from old password",
        );
    }
    user.password = newPassword;
    await user.save();
    return res
        .status(200)
        .json(new ApiResponse(200, null, "Password changed successfully"));
});

const resetPassword = asyncHandler(async (req, res) => {
    const { resetToken } = req.params;
    const { newPassword } = req.body;
    if (!resetToken) {
        throw new ApiError(400, "Reset password Token not found!!!");
    }
    if (!newPassword) {
        throw new ApiError(400, "New password is required");
    }
    const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    const user = await User.findOne({
        forgotPasswordToken: hashedToken,
        forgotPasswordTokenExpiry: { $gt: Date.now() },
    });
    if (!user) {
        throw new ApiError(400, "Token is either invalid or expired");
    }
    user.forgotPasswordToken = undefined;
    user.forgotPasswordTokenExpiry = undefined;
    user.refreshToken = undefined;
    user.password = newPassword;
    await user.save();

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Password reset successfully"));
});

export {
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
};

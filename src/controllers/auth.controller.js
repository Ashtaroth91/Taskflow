import { User } from '../models/user.model.js';
import { asyncHandler } from '../utils/async-handler.js';
import { ApiResponse } from '../utils/api-response.js';
import { ApiError } from '../utils/api-error.js';
import { sendEmail, emailVerificationTemplate, forgotPasswordTemplate } from '../utils/mail.js';

const getAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found", []);
        }
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Failed to generate tokens", [error.message]);
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({
        $or: [{ email }, { username }]
    });
    if (existingUser) {
        throw new ApiError(409, "User with this email or username already exists", []);
    }
    const user = await User.create({ 
        username, 
        email, 
        password, 
        isEmailVerified: false,
    });
    const {unHashedToken, hashedToken, tokenExpiry} = user.generateTemporaryToken();
    user.emailVerificationToken = hashedToken;
    user.emailVerificationTokenExpiry = tokenExpiry;
    await user.save({validateBeforeSave: false});

    await sendEmail({
        mail: user?.email,
        subject: "Verify your email for TaskFlow",
        mailgenContent: emailVerificationTemplate(user.username,`${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unHashedToken}`)
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    return res
        .status(201)
        .json(new ApiResponse(
            201, 
            {
                user : createdUser
            },
            "User registered successfully. Please check your email to verify your account."
        )
    );
});

const loginUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    if (!(username || email)) {
        throw new ApiError(400, "Username or email is required", []);
    }
    const user = await User.findOne({ $or: [{ username }, { email }] }).select("+password +isEmailVerified");
    if (!user) {
        throw new ApiError(401, "Invalid credentials", []);
    }
    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid credentials", []);
    }
    if (!user.isEmailVerified) {
        throw new ApiError(403, "Email not verified. Please verify your email before logging in.", []);
    }
    const { accessToken, refreshToken } = await getAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry");

    const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "strict"
    };
    
    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(new ApiResponse(
            200, 
            {
                user : loggedInUser,
                accessToken
            },
            "User logged in successfully"
        )
    );
});

export { registerUser, loginUser };
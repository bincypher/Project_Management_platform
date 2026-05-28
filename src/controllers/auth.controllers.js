import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/api-Response.utils.js";
import { ApiError } from "../utils/api-Error.utils.js";
import { asyncHandler } from "../utils/async-Handler.utils.js";
import { emailverificationMailgenContent, forgotPasswordMailgenContent, sendEmail } from "../utils/mail.utils.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Failed to generate access and refresh tokens");
    }

}

const registerUser = asyncHandler(async (req, res, next) => {
    const { username, email, password, role } = req.body;

    const existedUser = await User.findOne({
        $or: [{ email }, { username }]
    });

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }
    const user = await User.create({ username, email, password, isEmailVerified: false });
    const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;
    await user.save({ validateBeforeSave: false });

    await sendEmail({
        to: user?.email,
        subject: "Please verify your email",
        mailgenContent: emailverificationMailgenContent(user.username, `${req.protocol}://${req.get("host")}/api/v1/users/verify-email?token=${unHashedToken}`)

    });
    const createdUser = await User.findById(user._id).select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry");

    if (!createdUser) {
        throw new ApiError(500, "Failed to create user");
    }

    return res.status(201).json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const login = asyncHandler(async (req, res, next) => {
    const { email, password, username } = req.body;
    if (!email && !username) {
        throw new ApiError(400, "Email or username is required");
    }
    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid password");
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry");

    const options = {
        httpOnly: true,
        secure: true
    };

    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(
        new ApiResponse(
            200,
            { user: loggedInUser, accessToken, refreshToken },
            "User logged in successfully"
        )
    );
});

const logoutUser = asyncHandler(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user._id, { $set: { refreshToken: "" } }, { new: true });
    const options = {
        httpOnly: true,
        secure: true
    };
    return res.status(200).clearCookie("accessToken", "", options).clearCookie("refreshToken", "", options).json(new ApiResponse(200, null, "User logged out successfully"));
});

const getCurrentUser = asyncHandler(async (req, res, next) => {
    return res.status(200).json(new ApiResponse(200, req.user, "Current user retrieved successfully"));
});

const verifyEmail = asyncHandler(async (req, res, next) => {
    const { verificationToken } = req.params;
    if (!verificationToken) {
        throw new ApiError(400, "Email verification token is missing");
    }
    let hashedToken = crypto.createHash("sha256").update(verificationToken).digest("hex");

    const user = await User.findOne({ emailVerificationToken: hashedToken, emailVerificationExpiry: { $gt: Date.now() } });
    if (!user) {
        throw new ApiError(400, "Invalid or expired verification token");
    }
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;

    user.isEmailVerified = true;
    await user.save({ validateBeforeSave: false });
    return res.status(200).json(new ApiResponse(200, null, "Email verified successfully"));
});

const resendEmailVerification = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user?._id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    if (user.isEmailVerified) {
        throw new ApiError(409, "Email is already verified");
    }

    const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;
    await user.save({ validateBeforeSave: false });

    await sendEmail({
        to: user?.email,
        subject: "Please verify your email",
        mailgenContent: emailverificationMailgenContent(user.username, `${req.protocol}://${req.get("host")}/api/v1/users/verify-email?token=${unHashedToken}`)
    });
    return res.status(200).json(new ApiResponse(200, null, "Verification email resent successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res, next) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized, refresh token is missing");
    }
    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id);
        if (!user || user?.refreshToken !== incomingRefreshToken) {
            throw new ApiError(401, "Unauthorized, invalid refresh token");
        }
        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id);
        const options = {
            httpOnly: true,
            secure: true
        };
        await user.save();
        return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", newRefreshToken, options).json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access token refreshed successfully"));
    } catch (error) {
        throw new ApiError(401, "Unauthorized, invalid refresh token");
    }
});

const forgotPasswordRequest = asyncHandler(async (req, res, next) => {
    const { email } = req.body;
    if (!email) {
        throw new ApiError(400, "Email is required");
    }
    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();

    user.forgotPasswordToken = hashedToken;
    user.forgotPasswordExpiry = tokenExpiry;
    await user.save({ validateBeforeSave: false });
    await sendEmail({
        to: user?.email,
        subject: "Password reset request",
        mailgenContent: forgotPasswordMailgenContent(user.username, `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unHashedToken}`)
    });
    return res.status(200).json(new ApiResponse(200, null, "Password reset email sent successfully"));
});

const resetForgotPassword = asyncHandler(async (req, res, next) => {
    const { resetToken } = req.params;
    const { newPassword } = req.body;
    if (!resetToken) {
        throw new ApiError(489, "Password reset token is missing");
    }
    if (!newPassword) {
        throw new ApiError(489, "New password is required");
    }
    let hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    const user = await User.findOne({ forgotPasswordToken: hashedToken, forgotPasswordExpiry: { $gt: Date.now() } });
    if (!user) {
        throw new ApiError(489, "Invalid or expired password reset token");
    }
    user.password = newPassword;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
    await user.save({ validateBeforeSave: false });
    return res.status(200).json(new ApiResponse(200, null, "Password reset successfully"));
});

const changeCurrentPassword = asyncHandler(async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        throw new ApiError(400, "Current password and new password are required");
    }
    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    const isPasswordValid = await user.isPasswordCorrect(currentPassword);
    if (!isPasswordValid) {
        throw new ApiError(400, "Current password is invalid");
    }
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });
    return res.status(200).json(new ApiResponse(200, null, "Password changed successfully"));
});

export { registerUser, generateAccessAndRefreshTokens, login, logoutUser, getCurrentUser, verifyEmail, refreshAccessToken, resendEmailVerification, forgotPasswordRequest, resetForgotPassword, changeCurrentPassword };


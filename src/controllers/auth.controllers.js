import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/api-Response.utils.js";
import { ApiError } from "../utils/api-Error.utils.js";
import { asyncHandler } from "../utils/async-Handler.utils.js";
import { emailverificationMailgenContent, forgotPasswordMailgenContent, sendEmail } from "../utils/mail.utils.js";

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
    if(!email && !username) {
        throw new ApiError(400, "Email or username is required");
    }
    const user = await User.findOne({email});
    if(!user) {
        throw new ApiError(404, "User not found");
    }
    const isPasswordValid = await user.isPasswordCorrect(password);
    if(!isPasswordValid) {
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

export { registerUser, generateAccessAndRefreshTokens, login };


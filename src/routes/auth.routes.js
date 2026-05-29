import { Router } from "express";
import { registerUser, generateAccessAndRefreshTokens, login, logoutUser, getCurrentUser, verifyEmail, refreshAccessToken, resendEmailVerification, forgotPasswordRequest, resetForgotPassword, changeCurrentPassword } from "../controllers/auth.controllers.js";
import { validate } from "../middlewares/validator.middlewares.js";
import {
    userRegisterValidator,
    userloginValidator,
    userChangeCurrentPasswordValidator,
    userForgotPasswordRequestValidator,
    userResetForgotPasswordValidator
} from "../validators/index.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";


const router = Router();

//unsecured routes
router.route("/register").post(userRegisterValidator(), validate, registerUser);
router.route("/login").post(userloginValidator(), validate, login);
router.route("/verify-email/:verificationToken").get(verifyEmail);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/forgot-password").post(userForgotPasswordRequestValidator(), validate, forgotPasswordRequest);
router.route("/reset-password/:resetToken").post(userResetForgotPasswordValidator(), validate, resetForgotPassword);

//secure routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/resend-email-verification").post(verifyJWT, resendEmailVerification);
router.route("/change-password").post(verifyJWT, userChangeCurrentPasswordValidator(), validate, changeCurrentPassword);

export default router;
import { Router } from "express";
import {login, registerUser,logoutUser } from "../controllers/auth.controllers.js";
import { validate } from "../middlewares/validator.middlewares.js";
import { userRegisterValidator,userloginValidator } from "../validators/index.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";


const router = Router();

router.route("/register").post(userRegisterValidator(), validate, registerUser);
router.route("/login").post(userloginValidator(), validate, login);

//secure routes
router.route("/logout").post(verifyJWT, logoutUser);

export default router;
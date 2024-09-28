import express from "express";
import { googleLogin, googleCallback } from "../controller/googleAuthController.js";
import { signIn, signUp } from "../controller/authController.js";
import { logout } from "../controller/logoutController.js";
import { refreshToken } from "../controller/refreshTokenController.js";
import { validate } from "../middleware/validationMiddleware.js";
import { signUpSchema, signInSchema } from "../validation/authValidation.js";


const router = express.Router();


router.get('/google', googleLogin);
router.get('/google/callback', googleCallback);
router.post('/signup', validate(signUpSchema), signUp);
router.post('/login', validate(signInSchema), signIn);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);


export default router;


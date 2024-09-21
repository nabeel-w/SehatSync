import express from "express";
import { googleLogin, googleCallback } from "../controller/googleAuthController.js";
import { signIn, signUp } from "../controller/authController.js"
import { logout } from "../controller/logoutController.js"
import { refreshToken } from "../controller/refreshTokenController.js"


const router = express.Router();


router.get('/google', googleLogin);
router.get('/google/callback', googleCallback);
router.post('/signup', signUp);
router.post('/login', signIn);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);


export default router;


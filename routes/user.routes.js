import {Router} from 'express';
import {registerUser, loginUser, logoutUser, verifyOtp } from '../controllers/user.controllers.js';
import { handleQStashWebhook } from '../controllers/webhook.controller.js';
import { securityShield } from '../middlewares/arcjet.middleware.js';

const authRouter = Router();

authRouter.post('/register', securityShield, registerUser);
authRouter.post('/verify-otp', securityShield, verifyOtp);
authRouter.post('/login', securityShield, loginUser);
authRouter.post('/logout', securityShield, logoutUser);

authRouter.post('/webhook/send-email', handleQStashWebhook);

export default authRouter;
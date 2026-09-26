import express from 'express';
import { register, login, sendOtp, verifyOtp, oauthSync, getMe } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/oauth-sync', oauthSync);
router.get('/me', authenticate, getMe);

export default router;

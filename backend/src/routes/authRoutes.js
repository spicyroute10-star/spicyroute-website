import express from 'express';
import { 
  register, 
  registerWithOtp, 
  login, 
  sendOtp, 
  verifyOtp, 
  oauthSync, 
  getMe, 
  deleteAccount 
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/register-with-otp', registerWithOtp);
router.post('/login', login);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/oauth-sync', oauthSync);
router.get('/me', authenticate, getMe);
router.delete('/account', authenticate, deleteAccount);

export default router;

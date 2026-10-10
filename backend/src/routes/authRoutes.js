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

import { sendVerificationEmail } from '../services/emailService.js';

router.post('/register', register);
router.post('/register-with-otp', registerWithOtp);
router.post('/login', login);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/oauth-sync', oauthSync);
router.get('/me', authenticate, getMe);
router.delete('/account', authenticate, deleteAccount);

// Direct email diagnostics route to verify live SMTP configuration
router.get('/test-email', async (req, res) => {
  const targetEmail = req.query.email || 'spicyroute10@gmail.com';
  const hasUser = Boolean(process.env.EMAIL_USER);
  const hasPass = Boolean(process.env.EMAIL_PASS);
  const emailUser = process.env.EMAIL_USER || 'none';
  const passLength = (process.env.EMAIL_PASS || '').length;

  try {
    const result = await sendVerificationEmail(targetEmail, '987654');
    res.json({
      success: result.success,
      diagnostics: {
        hasUser,
        hasPass,
        emailUser,
        passLength,
        targetEmail
      },
      result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      diagnostics: {
        hasUser,
        hasPass,
        emailUser,
        passLength,
        targetEmail
      },
      error: error.message
    });
  }
});

export default router;

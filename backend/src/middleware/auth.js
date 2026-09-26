import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication token missing or invalid' });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'super_secret_food_delivery_jwt_key_2026';

    const decoded = jwt.verify(token, secret);
    const { data: user } = await supabase
      .from('users')
      .select('id, name, email, role, phone, address')
      .eq('id', decoded.userId)
      .single();

    if (!user) {
      return res.status(401).json({ error: 'User not found or session expired' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

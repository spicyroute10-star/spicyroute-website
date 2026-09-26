import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';

// In-memory OTP store with 5-minute expiry
const otpStore = new Map();

/**
 * Generates and sends a 6-digit OTP code to phone or email
 */
export const sendOtp = async (req, res) => {
  try {
    const { phone, email } = req.body;

    const identifier = (email ? email.trim().toLowerCase() : (phone ? phone.trim().replace(/\s+/g, '') : null));

    if (!identifier) {
      return res.status(400).json({ error: 'Valid mobile number or email address is required' });
    }

    // Generate real 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Check if user exists with this identifier
    let existingUser = null;
    if (email) {
      const { data } = await supabase.from('users').select('*').ilike('email', identifier).maybeSingle();
      existingUser = data;
    } else {
      const { data } = await supabase.from('users').select('*').eq('phone', identifier).maybeSingle();
      existingUser = data;
    }

    otpStore.set(identifier, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
    });

    console.log(`🔑 [2FA OTP Dispatch] Sent OTP "${otp}" to ${identifier}`);

    res.json({
      success: true,
      message: `6-Digit OTP code sent successfully to ${identifier}`,
      identifier,
      isNewUser: !existingUser,
      otp // returned so user can view/verify immediately
    });
  } catch (error) {
    console.error('Error in sendOtp:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

/**
 * Verifies the 6-digit OTP and authenticates/registers the user
 */
export const verifyOtp = async (req, res) => {
  try {
    const { phone, email, otp, name, role = 'CUSTOMER', address } = req.body;

    const identifier = (email ? email.trim().toLowerCase() : (phone ? phone.trim().replace(/\s+/g, '') : null));

    if (!identifier || !otp) {
      return res.status(400).json({ error: 'Contact identifier and OTP code are required' });
    }

    const cleanOtp = otp.toString().trim();
    const storedData = otpStore.get(identifier);

    if (!storedData || storedData.otp !== cleanOtp || Date.now() > storedData.expiresAt) {
      return res.status(400).json({ error: 'Invalid or expired OTP code. Please request a new OTP.' });
    }

    // Clean up OTP store
    otpStore.delete(identifier);

    const targetRole = (role || 'CUSTOMER').toUpperCase();

    // Find user
    let user = null;
    if (email) {
      const { data } = await supabase.from('users').select('*').ilike('email', identifier).maybeSingle();
      user = data;
    } else {
      const { data } = await supabase.from('users').select('*').eq('phone', identifier).maybeSingle();
      user = data;
    }

    if (user) {
      // Update role if explicitly selected
      if (targetRole && user.role !== targetRole) {
        const { data: updatedUser } = await supabase
          .from('users')
          .update({ role: targetRole })
          .eq('id', user.id)
          .select()
          .single();
        user = updatedUser;
      }
    } else {
      // Create new user account
      const userEmail = email ? identifier : `${targetRole.toLowerCase()}_${identifier}@spiceroute.com`;
      const userName = name || (targetRole === 'VENDOR' ? 'Restaurant Vendor' : 'Customer');
      const defaultPassword = await bcrypt.hash('otp_pass_' + Date.now(), 10);

      const { data: newUser, error: insertErr } = await supabase
        .from('users')
        .insert({
          name: userName,
          email: userEmail,
          phone: phone ? identifier : null,
          password: defaultPassword,
          role: targetRole,
          address: address || 'Current Location'
        })
        .select()
        .single();
      
      if (insertErr || !newUser) {
        throw new Error(insertErr?.message || 'Failed to create user');
      }
      user = newUser;
    }

    // Get user's restaurants
    const { data: restaurants } = await supabase
      .from('restaurants')
      .select('id, name, is_approved, is_open')
      .eq('owner_id', user.id);
    
    user.restaurants = restaurants || [];

    const secret = process.env.JWT_SECRET || 'super_secret_food_delivery_jwt_key_2026';
    const token = jwt.sign({ userId: user.id, role: user.role }, secret, { expiresIn: '7d' });

    res.json({
      message: 'OTP verification successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        restaurants: user.restaurants || []
      }
    });
  } catch (error) {
    console.error('Error in verifyOtp:', error);
    res.status(500).json({ error: error.message || 'Failed to verify OTP' });
  }
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role = 'CUSTOMER', phone, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();

    const { data: existingUser } = await supabase
      .from('users')
      .select('id, email')
      .ilike('email', cleanEmail)
      .maybeSingle();
    
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const targetRole = (role || 'CUSTOMER').toUpperCase();
    const hashedPassword = await bcrypt.hash(password, 10);
    const { data: user, error: insertError } = await supabase
      .from('users')
      .insert({
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        role: targetRole,
        phone: phone || null,
        address: address || 'Current Location'
      })
      .select()
      .single();

    if (insertError || !user) {
      console.error('Supabase user insert error:', insertError);
      return res.status(500).json({ error: insertError?.message || 'Failed to create user account' });
    }

    const secret = process.env.JWT_SECRET || 'super_secret_food_delivery_jwt_key_2026';
    const token = jwt.sign({ userId: user.id, role: user.role }, secret, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        restaurants: []
      }
    });
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({ error: error.message || 'Failed to register user' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .ilike('email', cleanEmail)
      .maybeSingle();

    if (!user || userError) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    let isMatch = false;
    if (user.password === password) {
      isMatch = true;
    } else {
      try {
        isMatch = await bcrypt.compare(password, user.password);
      } catch (e) {
        isMatch = false;
      }
    }

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Get user's restaurants
    const { data: restaurants } = await supabase
      .from('restaurants')
      .select('id, name, is_approved, is_open')
      .eq('owner_id', user.id);
    
    user.restaurants = restaurants || [];

    const secret = process.env.JWT_SECRET || 'super_secret_food_delivery_jwt_key_2026';
    const token = jwt.sign({ userId: user.id, role: user.role }, secret, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        restaurants: user.restaurants || []
      }
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ error: error.message || 'Failed to authenticate user' });
  }
};

export const oauthSync = async (req, res) => {
  try {
    const { email, name, authId, role = 'CUSTOMER' } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let { data: user } = await supabase
      .from('users')
      .select('*')
      .ilike('email', cleanEmail)
      .maybeSingle();

    if (!user && authId) {
      const { data: userByAuth } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', authId)
        .maybeSingle();
      user = userByAuth;
    }

    if (user) {
      if (authId && !user.auth_id) {
        await supabase.from('users').update({ auth_id: authId }).eq('id', user.id);
      }
    } else {
      const defaultPassword = await bcrypt.hash('oauth_user_' + Date.now(), 10);
      const targetRole = (role || 'CUSTOMER').toUpperCase();
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          name: name || cleanEmail.split('@')[0],
          email: cleanEmail,
          password: defaultPassword,
          role: targetRole,
          auth_id: authId || null,
          address: 'Current Location'
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }
      user = newUser;
    }

    const { data: restaurants } = await supabase
      .from('restaurants')
      .select('id, name, is_approved, is_open')
      .eq('owner_id', user.id);
    
    user.restaurants = restaurants || [];

    const secret = process.env.JWT_SECRET || 'super_secret_food_delivery_jwt_key_2026';
    const token = jwt.sign({ userId: user.id, role: user.role }, secret, { expiresIn: '7d' });

    res.json({
      message: 'OAuth sync successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        restaurants: user.restaurants
      }
    });
  } catch (error) {
    console.error('Error in oauthSync:', error);
    res.status(500).json({ error: error.message || 'Failed to sync OAuth session' });
  }
};

export const getMe = async (req, res) => {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('id, name, email, role, phone, address')
      .eq('id', req.user.id)
      .maybeSingle();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's restaurants
    const { data: restaurants } = await supabase
      .from('restaurants')
      .select('id, name, cuisine, is_approved, is_open, commission_rate')
      .eq('owner_id', user.id);
    
    user.restaurants = restaurants || [];

    res.json({ user });
  } catch (error) {
    console.error('Error in getMe:', error);
    res.status(500).json({ error: 'Failed to retrieve user profile' });
  }
};

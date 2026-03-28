import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (userResult.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const user = userResult[0];
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const { password: _, ...userWithoutPassword } = user;
    if (userWithoutPassword.faceDescriptor && typeof userWithoutPassword.faceDescriptor === 'string') {
      try { userWithoutPassword.faceDescriptor = JSON.parse(userWithoutPassword.faceDescriptor); } catch(e) {}
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      access_token: token,
      data: userWithoutPassword,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message,
    });
  }
};

export const register = async (req, res) => {
  try {
    const { name, email, password, dob, district, citizenNo, photoUrl, faceDescriptor } = req.body;

    if (!name || !email || !password || !dob || !district || !citizenNo || !photoUrl) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    const citizenNumRegex = /^\d{2}-\d{2}-\d{2}-\d{5}$|^\d{2}-\d{6}-\d{5}$/;
    if (!citizenNumRegex.test(citizenNo)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid citizenship number format. Use 11-11-11-11111 or 11-111111-11111',
      });
    }

    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.message,
      });
    }

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existingUser.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered',
      });
    }

    const existingCitizen = await db
      .select()
      .from(users)
      .where(eq(users.citizenNo, citizenNo));

    if (existingCitizen.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Citizen number already registered',
      });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
        dob: new Date(dob),
        district,
        citizenNo,
        photoUrl,
        faceDescriptor: faceDescriptor ? JSON.stringify(faceDescriptor) : null,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        district: users.district,
        photoUrl: users.photoUrl,
        faceDescriptor: users.faceDescriptor,
      });

    const token = generateToken({
      id: newUser[0].id,
      email: newUser[0].email,
      role: newUser[0].role,
    });

    const userData = { ...newUser[0] };
    if (userData.faceDescriptor && typeof userData.faceDescriptor === 'string') {
      try { userData.faceDescriptor = JSON.parse(userData.faceDescriptor); } catch(e) {}
    }

    return res.status(201).json({
      success: true,
      message: 'User registered successfully with face verification',
      access_token: token,
      data: userData,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { name, dob, district, photoUrl } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    if (!name || !dob || !district || !photoUrl) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    const updatedUser = await db
      .update(users)
      .set({
        name,
        dob: new Date(dob),
        district,
        photoUrl,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        district: users.district,
        photoUrl: users.photoUrl,
        dob: users.dob,
        updatedAt: users.updatedAt,
      });

    if (updatedUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser[0],
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return res.status(500).json({
      success: false,
      message: 'Profile update failed',
      error: error.message,
    });
  }
};
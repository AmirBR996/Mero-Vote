import express from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { authenticateToken } from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/admin.js';
import { hashPassword, validatePasswordStrength } from '../utils/password.js';

const router = express.Router();

/**
 * GET /users
 * Get all users (admin only)
 */
router.get('/', adminMiddleware, async (_req, res) => {
  try {
    const usersList = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        dob: users.dob,
        district: users.district,
        citizenNo: users.citizenNo,
        photoUrl: users.photoUrl,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users);

    return res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: usersList,
    });
  } catch (error) {
    console.error('Get all users error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message,
    });
  }
});

/**
 * GET /users/profile
 * Get current logged-in user's profile
 * Requires authentication
 */
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user[0];

    return res.status(200).json({
      success: true,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message,
    });
  }
});

/**
 * GET /users/:id
 * Get user details by ID
 * Requires authentication
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user[0];

    return res.status(200).json({
      success: true,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message,
    });
  }
});

/**
 * PUT /users/profile
 * Update current logged-in user's profile
 * Requires authentication
 * Body: { name?: string, photoUrl?: string, dob?: timestamp }
 */
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, photoUrl, dob } = req.body;

    // Build update object with only provided fields
    const updateData = {};
    if (name) updateData.name = name;
    if (photoUrl) updateData.photoUrl = photoUrl;
    if (dob) updateData.dob = new Date(dob);
    updateData.updatedAt = new Date();

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update',
      });
    }

    const updatedUser = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        dob: users.dob,
        district: users.district,
        citizenNo: users.citizenNo,
        photoUrl: users.photoUrl,
        createdAt: users.createdAt,
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
      user: updatedUser[0],
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message,
    });
  }
});

/**
 * PUT /users/change-password
 * Change password for current logged-in user
 * Requires authentication
 * Body: { currentPassword: string, newPassword: string }
 */
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Input validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required',
      });
    }

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.message,
      });
    }

    // Fetch user
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (userResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const user = userResult[0];

    // Verify current password
    const { comparePassword } = await import('../utils/password.js');
    const isPasswordValid = await comparePassword(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password
    await db
      .update(users)
      .set({
        password: hashedNewPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message,
    });
  }
});

export default router;

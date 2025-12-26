const express = require('express');
const router = express.Router();
const { query } = require('../db/database');
const authMiddleware = require('../middleware/auth.middleware');

// Get user profile
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await query(
      `SELECT u.id, u.username, u.email, u.first_name, u.last_name, 
              u.avatar_url, u.bio, u.created_at,
              up.cover_photo_url, up.location, up.website, up.birthday,
              up.about, up.work, up.education, up.interests
       FROM users u
       LEFT JOIN user_profiles up ON u.id = up.user_id
       WHERE u.id = $1 AND u.is_active = true`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user profile
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.id !== parseInt(req.params.id)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { firstName, lastName, bio, location, website, about, work, education } = req.body;

    // Update user table
    await query(
      `UPDATE users 
       SET first_name = $1, last_name = $2, bio = $3
       WHERE id = $4`,
      [firstName, lastName, bio, req.params.id]
    );

    // Update profile table
    await query(
      `UPDATE user_profiles 
       SET location = $1, website = $2, about = $3, work = $4, education = $5
       WHERE user_id = $6`,
      [location, website, about, work, education, req.params.id]
    );

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Search users
router.get('/search/:query', authMiddleware, async (req, res) => {
  try {
    const searchQuery = `%${req.params.query}%`;
    
    const result = await query(
      `SELECT id, username, first_name, last_name, avatar_url, bio
       FROM users
       WHERE (username ILIKE $1 OR first_name ILIKE $1 OR last_name ILIKE $1)
       AND is_active = true
       LIMIT 20`,
      [searchQuery]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

module.exports = router;

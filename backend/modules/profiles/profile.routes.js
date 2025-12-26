const express = require('express');
const router = express.Router();
const { query } = require('../../app/db/database');
const authMiddleware = require('../../app/middleware/auth.middleware');

// Get profile by user ID
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const result = await query(
      `SELECT u.id, u.username, u.email, u.first_name, u.last_name, 
              u.avatar_url, u.bio, u.created_at,
              up.cover_photo_url, up.location, up.website, up.birthday,
              up.gender, up.about, up.work, up.education, up.interests,
              up.privacy_settings,
              (SELECT COUNT(*) FROM user_relationships 
               WHERE user_id = u.id AND relationship_type = 'friend' AND status = 'accepted') as friend_count,
              (SELECT COUNT(*) FROM user_relationships 
               WHERE target_user_id = u.id AND relationship_type = 'follower') as follower_count,
              (SELECT COUNT(*) FROM posts WHERE user_id = u.id) as post_count
       FROM users u
       LEFT JOIN user_profiles up ON u.id = up.user_id
       WHERE u.id = $1 AND u.is_active = true`,
      [req.params.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const profile = result.rows[0];

    // Check relationship status with current user
    if (req.user.id !== parseInt(req.params.userId)) {
      const relationshipResult = await query(
        `SELECT relationship_type, status 
         FROM user_relationships 
         WHERE user_id = $1 AND target_user_id = $2`,
        [req.user.id, req.params.userId]
      );

      profile.relationship = relationshipResult.rows[0] || null;
    }

    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update profile
router.put('/:userId', authMiddleware, async (req, res) => {
  try {
    if (req.user.id !== parseInt(req.params.userId)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const {
      firstName, lastName, bio, coverPhotoUrl, location, website,
      birthday, gender, about, work, education, interests
    } = req.body;

    // Update user table
    await query(
      `UPDATE users 
       SET first_name = $1, last_name = $2, bio = $3
       WHERE id = $4`,
      [firstName, lastName, bio, req.params.userId]
    );

    // Update profile table
    await query(
      `UPDATE user_profiles 
       SET cover_photo_url = $1, location = $2, website = $3, birthday = $4,
           gender = $5, about = $6, work = $7, education = $8, interests = $9
       WHERE user_id = $10`,
      [coverPhotoUrl, location, website, birthday, gender, about, work, education, interests, req.params.userId]
    );

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Update privacy settings
router.put('/:userId/privacy', authMiddleware, async (req, res) => {
  try {
    if (req.user.id !== parseInt(req.params.userId)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { privacySettings } = req.body;

    await query(
      'UPDATE user_profiles SET privacy_settings = $1 WHERE user_id = $2',
      [JSON.stringify(privacySettings), req.params.userId]
    );

    res.json({ message: 'Privacy settings updated successfully' });
  } catch (error) {
    console.error('Error updating privacy settings:', error);
    res.status(500).json({ error: 'Failed to update privacy settings' });
  }
});

// Get user's friends
router.get('/:userId/friends', authMiddleware, async (req, res) => {
  try {
    const result = await query(
      `SELECT u.id, u.username, u.first_name, u.last_name, u.avatar_url,
              ur.created_at as friends_since
       FROM user_relationships ur
       JOIN users u ON ur.target_user_id = u.id
       WHERE ur.user_id = $1 AND ur.relationship_type = 'friend' AND ur.status = 'accepted'
       ORDER BY u.first_name, u.last_name`,
      [req.params.userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ error: 'Failed to fetch friends' });
  }
});

// Send friend request
router.post('/:userId/friend-request', authMiddleware, async (req, res) => {
  try {
    const targetUserId = parseInt(req.params.userId);

    if (req.user.id === targetUserId) {
      return res.status(400).json({ error: 'Cannot send friend request to yourself' });
    }

    // Check if relationship already exists
    const existing = await query(
      `SELECT * FROM user_relationships 
       WHERE user_id = $1 AND target_user_id = $2 AND relationship_type = 'friend'`,
      [req.user.id, targetUserId]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Friend request already sent or you are already friends' });
    }

    // Create friend request
    await query(
      `INSERT INTO user_relationships (user_id, target_user_id, relationship_type, status)
       VALUES ($1, $2, 'friend', 'pending')`,
      [req.user.id, targetUserId]
    );

    res.json({ message: 'Friend request sent' });
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ error: 'Failed to send friend request' });
  }
});

// Accept/reject friend request
router.post('/friend-request/:requestId/:action', authMiddleware, async (req, res) => {
  try {
    const { requestId, action } = req.params;

    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    // Verify the request is for the current user
    const request = await query(
      'SELECT * FROM user_relationships WHERE id = $1 AND target_user_id = $2',
      [requestId, req.user.id]
    );

    if (request.rows.length === 0) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    if (action === 'accept') {
      // Update status to accepted
      await query(
        'UPDATE user_relationships SET status = $1 WHERE id = $2',
        ['accepted', requestId]
      );

      // Create reciprocal relationship
      await query(
        `INSERT INTO user_relationships (user_id, target_user_id, relationship_type, status)
         VALUES ($1, $2, 'friend', 'accepted')
         ON CONFLICT DO NOTHING`,
        [req.user.id, request.rows[0].user_id]
      );

      res.json({ message: 'Friend request accepted' });
    } else {
      // Delete the request
      await query('DELETE FROM user_relationships WHERE id = $1', [requestId]);
      res.json({ message: 'Friend request rejected' });
    }
  } catch (error) {
    console.error('Error processing friend request:', error);
    res.status(500).json({ error: 'Failed to process friend request' });
  }
});

// Follow user
router.post('/:userId/follow', authMiddleware, async (req, res) => {
  try {
    const targetUserId = parseInt(req.params.userId);

    if (req.user.id === targetUserId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    await query(
      `INSERT INTO user_relationships (user_id, target_user_id, relationship_type, status)
       VALUES ($1, $2, 'follower', 'accepted')
       ON CONFLICT (user_id, target_user_id, relationship_type) DO NOTHING`,
      [req.user.id, targetUserId]
    );

    res.json({ message: 'User followed successfully' });
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({ error: 'Failed to follow user' });
  }
});

// Unfollow user
router.post('/:userId/unfollow', authMiddleware, async (req, res) => {
  try {
    await query(
      `DELETE FROM user_relationships 
       WHERE user_id = $1 AND target_user_id = $2 AND relationship_type = 'follower'`,
      [req.user.id, req.params.userId]
    );

    res.json({ message: 'User unfollowed successfully' });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({ error: 'Failed to unfollow user' });
  }
});

// Get user's posts
router.get('/:userId/posts', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT p.*, 
              u.username, u.first_name, u.last_name, u.avatar_url,
              COUNT(DISTINCT pi.id) FILTER (WHERE pi.interaction_type = 'like') as like_count,
              COUNT(DISTINCT c.id) as comment_count
       FROM posts p
       JOIN users u ON p.user_id = u.id
       LEFT JOIN post_interactions pi ON p.id = pi.post_id
       LEFT JOIN comments c ON p.id = c.post_id
       WHERE p.user_id = $1
       GROUP BY p.id, u.id
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.params.userId, limit, offset]
    );

    res.json({
      posts: result.rows,
      page: parseInt(page),
      hasMore: result.rows.length === parseInt(limit)
    });
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({ error: 'Failed to fetch user posts' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { query } = require('../../app/db/database');
const authMiddleware = require('../../app/middleware/auth.middleware');

// Get all groups
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let queryText = `
      SELECT g.*, 
             COUNT(gm.id) as member_count,
             EXISTS(SELECT 1 FROM group_members WHERE group_id = g.id AND user_id = $1) as is_member
      FROM groups g
      LEFT JOIN group_members gm ON g.id = gm.group_id AND gm.status = 'active'
      WHERE g.visibility = 'public'
    `;

    const params = [req.user.id];

    if (search) {
      queryText += ` AND (g.name ILIKE $${params.length + 1} OR g.description ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }

    queryText += ` GROUP BY g.id ORDER BY g.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await query(queryText, params);

    res.json({
      groups: result.rows,
      page: parseInt(page),
      hasMore: result.rows.length === parseInt(limit)
    });
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// Get user's groups
router.get('/my-groups', authMiddleware, async (req, res) => {
  try {
    const result = await query(
      `SELECT g.*, gm.role, gm.joined_at,
              COUNT(DISTINCT gm2.id) as member_count
       FROM groups g
       JOIN group_members gm ON g.id = gm.group_id
       LEFT JOIN group_members gm2 ON g.id = gm2.group_id AND gm2.status = 'active'
       WHERE gm.user_id = $1 AND gm.status = 'active'
       GROUP BY g.id, gm.role, gm.joined_at
       ORDER BY gm.joined_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user groups:', error);
    res.status(500).json({ error: 'Failed to fetch user groups' });
  }
});

// Create group
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, description, visibility = 'public', joinPolicy = 'open' } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Group name is required' });
    }

    // Create group
    const groupResult = await query(
      `INSERT INTO groups (name, description, creator_id, visibility, join_policy)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, description, req.user.id, visibility, joinPolicy]
    );

    const group = groupResult.rows[0];

    // Add creator as admin member
    await query(
      `INSERT INTO group_members (group_id, user_id, role, status)
       VALUES ($1, $2, 'admin', 'active')`,
      [group.id, req.user.id]
    );

    res.status(201).json(group);
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Failed to create group' });
  }
});

// Get group details
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await query(
      `SELECT g.*, 
              u.username as creator_username, u.first_name as creator_first_name, u.last_name as creator_last_name,
              COUNT(DISTINCT gm.id) as member_count,
              gm_user.role as user_role,
              gm_user.status as user_status
       FROM groups g
       LEFT JOIN users u ON g.creator_id = u.id
       LEFT JOIN group_members gm ON g.id = gm.group_id AND gm.status = 'active'
       LEFT JOIN group_members gm_user ON g.id = gm_user.group_id AND gm_user.user_id = $2
       WHERE g.id = $1
       GROUP BY g.id, u.username, u.first_name, u.last_name, gm_user.role, gm_user.status`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching group:', error);
    res.status(500).json({ error: 'Failed to fetch group' });
  }
});

// Join group
router.post('/:id/join', authMiddleware, async (req, res) => {
  try {
    const groupId = req.params.id;

    // Check group exists and get join policy
    const groupResult = await query(
      'SELECT join_policy FROM groups WHERE id = $1',
      [groupId]
    );

    if (groupResult.rows.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const joinPolicy = groupResult.rows[0].join_policy;
    const status = joinPolicy === 'open' ? 'active' : 'pending';

    // Add member
    await query(
      `INSERT INTO group_members (group_id, user_id, role, status)
       VALUES ($1, $2, 'member', $3)
       ON CONFLICT (group_id, user_id) 
       DO UPDATE SET status = $3`,
      [groupId, req.user.id, status]
    );

    res.json({
      message: status === 'active' ? 'Joined group successfully' : 'Join request sent',
      status
    });
  } catch (error) {
    console.error('Error joining group:', error);
    res.status(500).json({ error: 'Failed to join group' });
  }
});

// Leave group
router.post('/:id/leave', authMiddleware, async (req, res) => {
  try {
    await query(
      'DELETE FROM group_members WHERE group_id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    res.json({ message: 'Left group successfully' });
  } catch (error) {
    console.error('Error leaving group:', error);
    res.status(500).json({ error: 'Failed to leave group' });
  }
});

// Get group posts
router.get('/:id/posts', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Check if user is member
    const memberCheck = await query(
      'SELECT status FROM group_members WHERE group_id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (memberCheck.rows.length === 0 || memberCheck.rows[0].status !== 'active') {
      return res.status(403).json({ error: 'You must be a member to view posts' });
    }

    const result = await query(
      `SELECT gp.*, 
              u.username, u.first_name, u.last_name, u.avatar_url
       FROM group_posts gp
       JOIN users u ON gp.user_id = u.id
       WHERE gp.group_id = $1
       ORDER BY gp.is_pinned DESC, gp.created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.params.id, limit, offset]
    );

    res.json({
      posts: result.rows,
      page: parseInt(page),
      hasMore: result.rows.length === parseInt(limit)
    });
  } catch (error) {
    console.error('Error fetching group posts:', error);
    res.status(500).json({ error: 'Failed to fetch group posts' });
  }
});

// Create group post
router.post('/:id/posts', authMiddleware, async (req, res) => {
  try {
    const { content, mediaUrl } = req.body;

    // Check if user is member
    const memberCheck = await query(
      'SELECT status FROM group_members WHERE group_id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (memberCheck.rows.length === 0 || memberCheck.rows[0].status !== 'active') {
      return res.status(403).json({ error: 'You must be a member to post' });
    }

    const result = await query(
      `INSERT INTO group_posts (group_id, user_id, content, media_url)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.params.id, req.user.id, content, mediaUrl]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating group post:', error);
    res.status(500).json({ error: 'Failed to create group post' });
  }
});

// Get group members
router.get('/:id/members', authMiddleware, async (req, res) => {
  try {
    const result = await query(
      `SELECT u.id, u.username, u.first_name, u.last_name, u.avatar_url,
              gm.role, gm.status, gm.joined_at
       FROM group_members gm
       JOIN users u ON gm.user_id = u.id
       WHERE gm.group_id = $1 AND gm.status = 'active'
       ORDER BY 
         CASE gm.role 
           WHEN 'admin' THEN 1 
           WHEN 'moderator' THEN 2 
           ELSE 3 
         END,
         gm.joined_at ASC`,
      [req.params.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching group members:', error);
    res.status(500).json({ error: 'Failed to fetch group members' });
  }
});

module.exports = router;

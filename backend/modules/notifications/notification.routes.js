const express = require('express');
const router = express.Router();
const { query } = require('../../app/db/database');
const authMiddleware = require('../../app/middleware/auth.middleware');

// Get user's notifications
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const offset = (page - 1) * limit;

    let queryText = `
      SELECT n.*,
             u.username as actor_username,
             u.first_name as actor_first_name,
             u.last_name as actor_last_name,
             u.avatar_url as actor_avatar_url
      FROM notifications n
      LEFT JOIN users u ON n.actor_id = u.id
      WHERE n.user_id = $1
    `;

    const params = [req.user.id];

    if (unreadOnly === 'true') {
      queryText += ' AND n.is_read = false';
    }

    queryText += ' ORDER BY n.created_at DESC LIMIT $2 OFFSET $3';
    params.push(limit, offset);

    const result = await query(queryText, params);

    res.json({
      notifications: result.rows,
      page: parseInt(page),
      hasMore: result.rows.length === parseInt(limit)
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Get unread notification count
router.get('/unread-count', authMiddleware, async (req, res) => {
  try {
    const result = await query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false',
      [req.user.id]
    );

    res.json({ count: parseInt(result.rows[0].count) });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

// Mark notification as read
router.put('/:id/read', authMiddleware, async (req, res) => {
  try {
    const result = await query(
      'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.put('/mark-all-read', authMiddleware, async (req, res) => {
  try {
    await query(
      'UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false',
      [req.user.id]
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// Delete notification
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// Create notification (helper function, typically called internally)
const createNotification = async (userId, actorId, type, entityType, entityId, content) => {
  try {
    await query(
      `INSERT INTO notifications (user_id, actor_id, type, entity_type, entity_id, content)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, actorId, type, entityType, entityId, content]
    );
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

module.exports = router;
module.exports.createNotification = createNotification;

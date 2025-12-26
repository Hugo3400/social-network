const express = require('express');
const router = express.Router();
const { query } = require('../../app/db/database');
const authMiddleware = require('../../app/middleware/auth.middleware');

// Get user's conversations
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await query(
      `SELECT DISTINCT ON (c.id) 
              c.id, c.name, c.is_group_chat, c.updated_at,
              m.content as last_message,
              m.created_at as last_message_at,
              u.username as last_sender_username,
              COUNT(*) FILTER (WHERE m.is_read = false AND m.sender_id != $1) OVER (PARTITION BY c.id) as unread_count,
              json_agg(DISTINCT jsonb_build_object(
                'id', pu.id,
                'username', pu.username,
                'first_name', pu.first_name,
                'last_name', pu.last_name,
                'avatar_url', pu.avatar_url
              )) OVER (PARTITION BY c.id) as participants
       FROM conversations c
       JOIN conversation_participants cp ON c.id = cp.conversation_id
       LEFT JOIN messages m ON c.id = m.conversation_id
       LEFT JOIN users u ON m.sender_id = u.id
       LEFT JOIN conversation_participants cp2 ON c.id = cp2.conversation_id
       LEFT JOIN users pu ON cp2.user_id = pu.id
       WHERE cp.user_id = $1
       ORDER BY c.id, m.created_at DESC NULLS LAST`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Create new conversation
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { participantIds, isGroupChat = false, name } = req.body;

    if (!participantIds || participantIds.length === 0) {
      return res.status(400).json({ error: 'At least one participant is required' });
    }

    // For direct messages, check if conversation already exists
    if (!isGroupChat && participantIds.length === 1) {
      const existing = await query(
        `SELECT c.id 
         FROM conversations c
         JOIN conversation_participants cp1 ON c.id = cp1.conversation_id
         JOIN conversation_participants cp2 ON c.id = cp2.conversation_id
         WHERE c.is_group_chat = false
         AND cp1.user_id = $1
         AND cp2.user_id = $2`,
        [req.user.id, participantIds[0]]
      );

      if (existing.rows.length > 0) {
        return res.json({ id: existing.rows[0].id, existing: true });
      }
    }

    // Create conversation
    const conversationResult = await query(
      'INSERT INTO conversations (is_group_chat, name) VALUES ($1, $2) RETURNING *',
      [isGroupChat, name]
    );

    const conversation = conversationResult.rows[0];

    // Add creator as participant
    await query(
      'INSERT INTO conversation_participants (conversation_id, user_id) VALUES ($1, $2)',
      [conversation.id, req.user.id]
    );

    // Add other participants
    for (const participantId of participantIds) {
      if (participantId !== req.user.id) {
        await query(
          'INSERT INTO conversation_participants (conversation_id, user_id) VALUES ($1, $2)',
          [conversation.id, participantId]
        );
      }
    }

    res.status(201).json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Get messages from a conversation
router.get('/:conversationId/messages', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    // Verify user is participant
    const participantCheck = await query(
      'SELECT id FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2',
      [req.params.conversationId, req.user.id]
    );

    if (participantCheck.rows.length === 0) {
      return res.status(403).json({ error: 'You are not a participant in this conversation' });
    }

    const result = await query(
      `SELECT m.*,
              u.username, u.first_name, u.last_name, u.avatar_url
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.conversation_id = $1
       ORDER BY m.created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.params.conversationId, limit, offset]
    );

    // Mark messages as read
    await query(
      `UPDATE messages 
       SET is_read = true 
       WHERE conversation_id = $1 AND sender_id != $2 AND is_read = false`,
      [req.params.conversationId, req.user.id]
    );

    res.json({
      messages: result.rows.reverse(),
      page: parseInt(page),
      hasMore: result.rows.length === parseInt(limit)
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send message
router.post('/:conversationId/messages', authMiddleware, async (req, res) => {
  try {
    const { content, mediaUrl } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Verify user is participant
    const participantCheck = await query(
      'SELECT id FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2',
      [req.params.conversationId, req.user.id]
    );

    if (participantCheck.rows.length === 0) {
      return res.status(403).json({ error: 'You are not a participant in this conversation' });
    }

    // Insert message
    const result = await query(
      `INSERT INTO messages (conversation_id, sender_id, content, media_url)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.params.conversationId, req.user.id, content, mediaUrl]
    );

    // Update conversation timestamp
    await query(
      'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [req.params.conversationId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Mark conversation as read
router.post('/:conversationId/mark-read', authMiddleware, async (req, res) => {
  try {
    await query(
      `UPDATE messages 
       SET is_read = true 
       WHERE conversation_id = $1 AND sender_id != $2`,
      [req.params.conversationId, req.user.id]
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

// Get conversation details
router.get('/:conversationId', authMiddleware, async (req, res) => {
  try {
    const result = await query(
      `SELECT c.*,
              json_agg(json_build_object(
                'id', u.id,
                'username', u.username,
                'first_name', u.first_name,
                'last_name', u.last_name,
                'avatar_url', u.avatar_url
              )) as participants
       FROM conversations c
       JOIN conversation_participants cp ON c.id = cp.conversation_id
       JOIN users u ON cp.user_id = u.id
       WHERE c.id = $1
       GROUP BY c.id`,
      [req.params.conversationId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

module.exports = router;

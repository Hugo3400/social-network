const express = require('express');
const router = express.Router();
const { query } = require('../../app/db/database');
const authMiddleware = require('../../app/middleware/auth.middleware');

// Get feed posts
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT p.*, 
              u.username, u.first_name, u.last_name, u.avatar_url,
              COUNT(DISTINCT pi.id) FILTER (WHERE pi.interaction_type = 'like') as like_count,
              COUNT(DISTINCT c.id) as comment_count,
              EXISTS(SELECT 1 FROM post_interactions WHERE post_id = p.id AND user_id = $1 AND interaction_type = 'like') as user_liked
       FROM posts p
       JOIN users u ON p.user_id = u.id
       LEFT JOIN post_interactions pi ON p.id = pi.post_id
       LEFT JOIN comments c ON p.id = c.post_id
       WHERE p.visibility = 'public' OR p.user_id = $1
       OR p.user_id IN (
         SELECT target_user_id FROM user_relationships 
         WHERE user_id = $1 AND relationship_type = 'friend' AND status = 'accepted'
       )
       GROUP BY p.id, u.id
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    res.json({
      posts: result.rows,
      page: parseInt(page),
      hasMore: result.rows.length === parseInt(limit)
    });
  } catch (error) {
    console.error('Error fetching feed:', error);
    res.status(500).json({ error: 'Failed to fetch feed' });
  }
});

// Create post
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { content, mediaUrl, mediaType, visibility = 'public' } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const result = await query(
      `INSERT INTO posts (user_id, content, media_url, media_type, visibility)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.user.id, content, mediaUrl, mediaType, visibility]
    );

    // Extract and save hashtags
    const hashtags = content.match(/#[\w]+/g);
    if (hashtags) {
      for (const tag of hashtags) {
        const tagName = tag.substring(1).toLowerCase();
        
        // Insert or update hashtag
        const hashtagResult = await query(
          `INSERT INTO hashtags (tag, usage_count) 
           VALUES ($1, 1) 
           ON CONFLICT (tag) 
           DO UPDATE SET usage_count = hashtags.usage_count + 1
           RETURNING id`,
          [tagName]
        );

        // Link post to hashtag
        await query(
          `INSERT INTO post_hashtags (post_id, hashtag_id) VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [result.rows[0].id, hashtagResult.rows[0].id]
        );
      }
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Repost
router.post('/:id/repost', authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;
    const parentPostId = req.params.id;

    // Check if post exists
    const checkPost = await query('SELECT id FROM posts WHERE id = $1', [parentPostId]);
    if (checkPost.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Create repost
    const result = await query(
      `INSERT INTO posts (user_id, content, parent_post_id, is_repost, visibility)
       VALUES ($1, $2, $3, true, 'public')
       RETURNING *`,
      [req.user.id, content || '', parentPostId]
    );

    // Create interaction record
    await query(
      `INSERT INTO post_interactions (post_id, user_id, interaction_type)
       VALUES ($1, $2, 'repost')
       ON CONFLICT DO NOTHING`,
      [parentPostId, req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating repost:', error);
    res.status(500).json({ error: 'Failed to create repost' });
  }
});

// Like/unlike post
router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    const postId = req.params.id;

    // Check if already liked
    const existing = await query(
      `SELECT id FROM post_interactions 
       WHERE post_id = $1 AND user_id = $2 AND interaction_type = 'like'`,
      [postId, req.user.id]
    );

    if (existing.rows.length > 0) {
      // Unlike
      await query(
        `DELETE FROM post_interactions 
         WHERE post_id = $1 AND user_id = $2 AND interaction_type = 'like'`,
        [postId, req.user.id]
      );

      res.json({ liked: false });
    } else {
      // Like
      await query(
        `INSERT INTO post_interactions (post_id, user_id, interaction_type)
         VALUES ($1, $2, 'like')`,
        [postId, req.user.id]
      );

      res.json({ liked: true });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

// Get post comments
router.get('/:id/comments', authMiddleware, async (req, res) => {
  try {
    const result = await query(
      `SELECT c.*, 
              u.username, u.first_name, u.last_name, u.avatar_url
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.post_id = $1
       ORDER BY c.created_at ASC`,
      [req.params.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Add comment
router.post('/:id/comments', authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    const result = await query(
      `INSERT INTO comments (post_id, user_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [req.params.id, req.user.id, content]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Delete post
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM posts WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found or unauthorized' });
    }

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// Search posts by hashtag
router.get('/hashtag/:tag', authMiddleware, async (req, res) => {
  try {
    const result = await query(
      `SELECT p.*, 
              u.username, u.first_name, u.last_name, u.avatar_url,
              COUNT(DISTINCT pi.id) FILTER (WHERE pi.interaction_type = 'like') as like_count,
              COUNT(DISTINCT c.id) as comment_count
       FROM posts p
       JOIN users u ON p.user_id = u.id
       JOIN post_hashtags ph ON p.id = ph.post_id
       JOIN hashtags h ON ph.hashtag_id = h.id
       LEFT JOIN post_interactions pi ON p.id = pi.post_id
       LEFT JOIN comments c ON p.id = c.post_id
       WHERE h.tag = $1 AND p.visibility = 'public'
       GROUP BY p.id, u.id
       ORDER BY p.created_at DESC
       LIMIT 50`,
      [req.params.tag.toLowerCase()]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error searching hashtag:', error);
    res.status(500).json({ error: 'Failed to search hashtag' });
  }
});

module.exports = router;

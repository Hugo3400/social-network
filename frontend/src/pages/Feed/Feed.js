import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Box,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Avatar,
  IconButton,
  Typography,
  CircularProgress
} from '@mui/material';
import { Favorite, ChatBubble, Repeat, Send } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export default function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      const response = await axios.get('/api/feed');
      setPosts(response.data.posts);
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      await axios.post('/api/feed', { content: newPost });
      setNewPost('');
      loadFeed();
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleLike = async (postId) => {
    try {
      await axios.post(`/api/feed/${postId}/like`);
      loadFeed();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Create Post */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <form onSubmit={handleCreatePost}>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="What's on your mind?"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              endIcon={<Send />}
              disabled={!newPost.trim()}
            >
              Post
            </Button>
          </Box>
        </form>
      </Paper>

      {/* Feed */}
      {posts.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No posts yet. Be the first to share something!
          </Typography>
        </Paper>
      ) : (
        posts.map((post) => (
          <Card key={post.id} sx={{ mb: 2 }}>
            <CardHeader
              avatar={<Avatar src={post.avatar_url}>{post.first_name?.[0]}</Avatar>}
              title={`${post.first_name} ${post.last_name}`}
              subheader={`@${post.username} · ${new Date(post.created_at).toLocaleDateString()}`}
            />
            <CardContent>
              <Typography variant="body1">{post.content}</Typography>
            </CardContent>
            <CardActions>
              <IconButton onClick={() => handleLike(post.id)} color={post.user_liked ? 'primary' : 'default'}>
                <Favorite />
              </IconButton>
              <Typography variant="body2" color="text.secondary">
                {post.like_count || 0}
              </Typography>

              <IconButton>
                <ChatBubble />
              </IconButton>
              <Typography variant="body2" color="text.secondary">
                {post.comment_count || 0}
              </Typography>

              <IconButton>
                <Repeat />
              </IconButton>
            </CardActions>
          </Card>
        ))
      )}
    </Container>
  );
}

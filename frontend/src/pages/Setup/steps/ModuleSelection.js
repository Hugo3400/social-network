import React from 'react';
import {
  Box,
  Button,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Paper,
  Grid
} from '@mui/material';

const modules = [
  {
    key: 'feed',
    name: 'Public Feed',
    description: 'Twitter/X-style public posts, reposts, likes, and comments',
    icon: '📱'
  },
  {
    key: 'groups',
    name: 'Groups & Communities',
    description: 'HumHub-style groups with posts, members, and permissions',
    icon: '👥'
  },
  {
    key: 'profiles',
    name: 'Extended Profiles',
    description: 'Facebook-style complete user profiles with friends and followers',
    icon: '👤'
  },
  {
    key: 'messaging',
    name: 'Private Messaging',
    description: 'Real-time direct messages and group chats',
    icon: '💬'
  },
  {
    key: 'notifications',
    name: 'Notifications',
    description: 'Universal notification system for all activities',
    icon: '🔔'
  }
];

export default function ModuleSelection({ config, updateConfig, onNext, onBack }) {
  const handleToggle = (moduleKey) => {
    updateConfig({ [moduleKey]: !config[moduleKey] });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Module Selection
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Choose which social features to enable. You can change these later.
      </Typography>

      <Grid container spacing={2}>
        {modules.map((module) => (
          <Grid item xs={12} key={module.key}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                cursor: 'pointer',
                transition: 'all 0.2s',
                bgcolor: config[module.key] ? 'action.selected' : 'background.paper',
                '&:hover': { bgcolor: 'action.hover' }
              }}
              onClick={() => handleToggle(module.key)}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={config[module.key]}
                    onChange={() => handleToggle(module.key)}
                  />
                }
                label={
                  <Box>
                    <Typography variant="subtitle1">
                      {module.icon} {module.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {module.description}
                    </Typography>
                  </Box>
                }
                sx={{ m: 0, width: '100%' }}
              />
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
        <Button variant="outlined" onClick={onBack}>
          Back
        </Button>
        <Button variant="contained" onClick={onNext} sx={{ flex: 1 }}>
          Continue to Finalization
        </Button>
      </Box>
    </Box>
  );
}

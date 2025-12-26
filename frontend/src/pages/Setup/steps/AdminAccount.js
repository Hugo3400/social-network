import React from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid
} from '@mui/material';

export default function AdminAccount({ config, updateConfig, onNext, onBack, setError }) {
  const handleChange = (field) => (event) => {
    updateConfig({ [field]: event.target.value });
  };

  const handleSubmit = () => {
    // Validation
    if (!config.username || !config.email || !config.password) {
      setError('All fields are required');
      return;
    }

    if (config.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!config.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    onNext();
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Administrator Account
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Create the first administrator account.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="First Name"
            value={config.firstName}
            onChange={handleChange('firstName')}
            placeholder="Admin"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Last Name"
            value={config.lastName}
            onChange={handleChange('lastName')}
            placeholder="User"
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            label="Username"
            value={config.username}
            onChange={handleChange('username')}
            placeholder="admin"
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            label="Email"
            type="email"
            value={config.email}
            onChange={handleChange('email')}
            placeholder="admin@example.com"
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            label="Password"
            type="password"
            value={config.password}
            onChange={handleChange('password')}
            placeholder="Enter a secure password (min. 6 characters)"
            helperText="Minimum 6 characters"
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" onClick={onBack}>
              Back
            </Button>
            <Button 
              variant="contained" 
              onClick={handleSubmit} 
              sx={{ flex: 1 }}
              disabled={!config.username || !config.email || !config.password}
            >
              Continue
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import axios from 'axios';

export default function DatabaseConfig({ config, updateConfig, onNext, setError }) {
  const [testing, setTesting] = useState(false);

  const handleChange = (field) => (event) => {
    updateConfig({ [field]: event.target.value });
  };

  const testConnection = async () => {
    setTesting(true);
    setError('');

    try {
      const response = await axios.post('/api/setup/test-db', config);
      
      if (response.data.success) {
        alert('✅ Database connection successful!');
        onNext();
      }
    } catch (error) {
      setError(error.response?.data?.details || 'Database connection failed');
    } finally {
      setTesting(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Database Configuration
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Configure your PostgreSQL database connection. Make sure the database exists.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Database Type</InputLabel>
            <Select
              value={config.type}
              label="Database Type"
              onChange={handleChange('type')}
            >
              <MenuItem value="postgresql">PostgreSQL</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Host"
            value={config.host}
            onChange={handleChange('host')}
            placeholder="localhost"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Port"
            type="number"
            value={config.port}
            onChange={handleChange('port')}
            placeholder="5432"
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Database Name"
            value={config.name}
            onChange={handleChange('name')}
            placeholder="social_hybrid"
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Username"
            value={config.user}
            onChange={handleChange('user')}
            placeholder="postgres"
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={config.password}
            onChange={handleChange('password')}
            placeholder="Enter database password"
          />
        </Grid>

        <Grid item xs={12}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={testConnection}
            disabled={testing || !config.password}
          >
            {testing ? <CircularProgress size={24} /> : 'Test Connection & Continue'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}

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
  CircularProgress,
  InputAdornment,
  Chip
} from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import axios from 'axios';

export default function DatabaseConfig({ config, updateConfig, onNext, setError }) {
  const [testing, setTesting] = useState(false);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    
    // Auto-adjust port and host when database type changes
    if (field === 'type') {
      const defaultPort = value === 'mysql' ? 3306 : 5432;
      const defaultHost = value === 'mysql' ? 'host.docker.internal' : 'postgres';
      updateConfig({ [field]: value, port: defaultPort, host: defaultHost });
    } else {
      updateConfig({ [field]: value });
    }
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
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <StorageIcon sx={{ mr: 1, color: '#667eea', fontSize: 28 }} />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Database Configuration
        </Typography>
      </Box>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.8 }}>
        Configure your database connection. Make sure the database exists. Choose PostgreSQL or MySQL/MariaDB.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Database Type</InputLabel>
            <Select
              value={config.type}
              label="Database Type"
              onChange={handleChange('type')}
              sx={{
                '& .MuiOutlinedInput-notchedOutline': {
                  borderWidth: 2,
                  borderColor: 'rgba(102, 126, 234, 0.2)'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(102, 126, 234, 0.4)'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#667eea'
                }
              }}
            >
              <MenuItem value="postgresql">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <StorageIcon sx={{ mr: 1, fontSize: 20 }} />
                  PostgreSQL
                  <Chip label="Recommended" size="small" color="primary" sx={{ ml: 1 }} />
                </Box>
              </MenuItem>
              <MenuItem value="mysql">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <StorageIcon sx={{ mr: 1, fontSize: 20 }} />
                  MySQL / MariaDB
                  <Chip label="phpMyAdmin Compatible" size="small" color="success" sx={{ ml: 1 }} />
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Host"
            value={config.host}
            onChange={handleChange('host')}
            placeholder={config.type === 'mysql' ? 'host.docker.internal ou IP' : 'postgres'}
            helperText={
              config.type === 'mysql' 
                ? 'Docker: host.docker.internal | Serveur: adresse IP ou nom d’hôte'
                : 'Docker: postgres (nom du service) | Serveur: localhost ou IP'
            }
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderWidth: 2, borderColor: 'rgba(102, 126, 234, 0.2)' },
                '&:hover fieldset': { borderColor: 'rgba(102, 126, 234, 0.4)' },
                '&.Mui-focused fieldset': { borderColor: '#667eea' }
              }
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Port"
            type="number"
            value={config.port}
            onChange={handleChange('port')}
            placeholder={config.type === 'mysql' ? '3306' : '5432'}
            helperText={config.type === 'mysql' ? 'Default MySQL/MariaDB port' : 'Default PostgreSQL port'}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderWidth: 2, borderColor: 'rgba(102, 126, 234, 0.2)' },
                '&:hover fieldset': { borderColor: 'rgba(102, 126, 234, 0.4)' },
                '&.Mui-focused fieldset': { borderColor: '#667eea' }
              }
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Database Name"
            value={config.name}
            onChange={handleChange('name')}
            placeholder="social_hybrid"
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderWidth: 2, borderColor: 'rgba(102, 126, 234, 0.2)' },
                '&:hover fieldset': { borderColor: 'rgba(102, 126, 234, 0.4)' },
                '&.Mui-focused fieldset': { borderColor: '#667eea' }
              }
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Username"
            value={config.user}
            onChange={handleChange('user')}
            placeholder="postgres"
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderWidth: 2, borderColor: 'rgba(102, 126, 234, 0.2)' },
                '&:hover fieldset': { borderColor: 'rgba(102, 126, 234, 0.4)' },
                '&.Mui-focused fieldset': { borderColor: '#667eea' }
              }
            }}
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
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderWidth: 2, borderColor: 'rgba(102, 126, 234, 0.2)' },
                '&:hover fieldset': { borderColor: 'rgba(102, 126, 234, 0.4)' },
                '&.Mui-focused fieldset': { borderColor: '#667eea' }
              }
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={testConnection}
            disabled={testing || !config.password}
            startIcon={testing ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
            sx={{
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              borderRadius: 2,
              textTransform: 'none',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
                background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)'
              },
              '&:disabled': {
                background: 'rgba(0, 0, 0, 0.12)'
              }
            }}
          >
            {testing ? 'Testing Connection...' : 'Test Connection & Continue'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}

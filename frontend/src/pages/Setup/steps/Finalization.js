import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
  LinearProgress
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ErrorIcon from '@mui/icons-material/Error';
import axios from 'axios';

export default function Finalization({ config, onBack, onComplete, setError }) {
  const [installing, setInstalling] = useState(false);
  const [steps, setSteps] = useState([
    { label: 'Initialize database schema', status: 'pending' },
    { label: 'Create administrator account', status: 'pending' },
    { label: 'Save configuration', status: 'pending' },
    { label: 'Finalize installation', status: 'pending' }
  ]);

  const updateStepStatus = (index, status) => {
    setSteps((prev) =>
      prev.map((step, i) => (i === index ? { ...step, status } : step))
    );
  };

  const startInstallation = async () => {
    setInstalling(true);
    setError('');

    try {
      // Step 1: Initialize database
      updateStepStatus(0, 'loading');
      await axios.post('/api/setup/init-db', config.database);
      updateStepStatus(0, 'completed');

      // Step 2: Create admin account
      updateStepStatus(1, 'loading');
      await axios.post('/api/setup/create-admin', {
        dbConfig: config.database,
        adminData: config.admin
      });
      updateStepStatus(1, 'completed');

      // Step 3: Save configuration
      updateStepStatus(2, 'loading');
      const fullConfig = {
        project: {
          name: 'Social Hybrid Network',
          description: 'A modern hybrid social network platform'
        },
        server: config.server,
        database: config.database,
        admin: {
          username: config.admin.username,
          email: config.admin.email
        },
        modules: config.modules,
        security: {
          jwtSecret: 'REPLACE_WITH_RANDOM_SECRET',
          jwtExpiration: '24h',
          bcryptRounds: 10
        },
        uploads: {
          maxFileSize: 5242880,
          allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        }
      };

      await axios.post('/api/setup/save-config', fullConfig);
      updateStepStatus(2, 'completed');

      // Step 4: Finalize
      updateStepStatus(3, 'loading');
      await new Promise((resolve) => setTimeout(resolve, 1000));
      updateStepStatus(3, 'completed');

      // Wait a moment for user to see completion
      setTimeout(() => {
        alert('🎉 Installation completed successfully! The application will now reload.');
        window.location.href = '/';
      }, 1500);
    } catch (error) {
      const currentStep = steps.findIndex((s) => s.status === 'loading');
      if (currentStep !== -1) {
        updateStepStatus(currentStep, 'error');
      }
      setError(
        error.response?.data?.details ||
          error.response?.data?.error ||
          'Installation failed. Please check your configuration and try again.'
      );
      setInstalling(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon color="success" />;
      case 'loading':
        return <CircularProgress size={24} />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <PendingIcon color="disabled" />;
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Ready to Install
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Review your configuration and click "Install" to complete the setup.
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Database:</strong> {config.database.host}:{config.database.port}/{config.database.name}
          <br />
          <strong>Admin User:</strong> {config.admin.username} ({config.admin.email})
          <br />
          <strong>Enabled Modules:</strong>{' '}
          {Object.entries(config.modules)
            .filter(([_, enabled]) => enabled)
            .map(([key]) => key)
            .join(', ')}
        </Typography>
      </Alert>

      {installing && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress />
          <List>
            {steps.map((step, index) => (
              <ListItem key={index}>
                <ListItemIcon>{getStatusIcon(step.status)}</ListItemIcon>
                <ListItemText primary={step.label} />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button variant="outlined" onClick={onBack} disabled={installing}>
          Back
        </Button>
        <Button
          variant="contained"
          onClick={startInstallation}
          disabled={installing}
          sx={{ flex: 1 }}
        >
          {installing ? 'Installing...' : '🚀 Install Now'}
        </Button>
      </Box>
    </Box>
  );
}

import React, { useState } from 'react';
import {
  Container,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import DatabaseConfig from './steps/DatabaseConfig';
import ServerConfig from './steps/ServerConfig';
import AdminAccount from './steps/AdminAccount';
import ModuleSelection from './steps/ModuleSelection';
import Finalization from './steps/Finalization';

const steps = ['Database', 'Server', 'Admin Account', 'Modules', 'Finalize'];

export default function SetupWizard({ onComplete }) {
  const [activeStep, setActiveStep] = useState(0);
  const [config, setConfig] = useState({
    database: {
      type: 'postgresql',
      host: 'localhost',
      port: 5432,
      name: 'social_hybrid',
      user: 'postgres',
      password: ''
    },
    server: {
      port: 3001,
      host: 'localhost'
    },
    admin: {
      username: 'admin',
      email: 'admin@example.com',
      password: '',
      firstName: 'Admin',
      lastName: 'User'
    },
    modules: {
      feed: true,
      groups: true,
      profiles: true,
      messaging: true,
      notifications: true
    }
  });
  const [error, setError] = useState('');

  const handleNext = () => {
    setError('');
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setError('');
    setActiveStep((prevStep) => prevStep - 1);
  };

  const updateConfig = (section, data) => {
    setConfig((prev) => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <DatabaseConfig
            config={config.database}
            updateConfig={(data) => updateConfig('database', data)}
            onNext={handleNext}
            setError={setError}
          />
        );
      case 1:
        return (
          <ServerConfig
            config={config.server}
            updateConfig={(data) => updateConfig('server', data)}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <AdminAccount
            config={config.admin}
            updateConfig={(data) => updateConfig('admin', data)}
            onNext={handleNext}
            onBack={handleBack}
            setError={setError}
          />
        );
      case 3:
        return (
          <ModuleSelection
            config={config.modules}
            updateConfig={(data) => updateConfig('modules', data)}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <Finalization
            config={config}
            onBack={handleBack}
            onComplete={onComplete}
            setError={setError}
          />
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            🚀 Social Hybrid Network
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Installation Wizard
          </Typography>
        </Box>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {getStepContent(activeStep)}
      </Paper>
    </Container>
  );
}

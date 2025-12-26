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
  CircularProgress,
  Fade,
  Slide
} from '@mui/material';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
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
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 8,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.3
        }
      }}
    >
      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <Fade in timeout={800}>
          <Paper
            elevation={24}
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
              border: '1px solid rgba(255, 255, 255, 0.18)'
            }}
          >
            <Slide direction="down" in timeout={600}>
              <Box sx={{ mb: 5, textAlign: 'center' }}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    mb: 2,
                    boxShadow: '0 10px 40px rgba(102, 126, 234, 0.4)',
                    animation: 'pulse 2s ease-in-out infinite',
                    '@keyframes pulse': {
                      '0%, 100%': { transform: 'scale(1)' },
                      '50%': { transform: 'scale(1.05)' }
                    }
                  }}
                >
                  <RocketLaunchIcon sx={{ fontSize: 40, color: 'white' }} />
                </Box>
                <Typography
                  variant="h3"
                  gutterBottom
                  sx={{
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1
                  }}
                >
                  Social Hybrid Network
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 500,
                    letterSpacing: '0.5px'
                  }}
                >
                  Installation Wizard
                </Typography>
              </Box>
            </Slide>

            <Stepper
              activeStep={activeStep}
              sx={{
                mb: 5,
                '& .MuiStepLabel-root .Mui-completed': {
                  color: '#667eea'
                },
                '& .MuiStepLabel-root .Mui-active': {
                  color: '#764ba2'
                },
                '& .MuiStepLabel-label.Mui-active': {
                  fontWeight: 600
                }
              }}
            >
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {error && (
              <Fade in>
                <Alert
                  severity="error"
                  sx={{
                    mb: 3,
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(244, 67, 54, 0.2)'
                  }}
                >
                  {error}
                </Alert>
              </Fade>
            )}

            <Slide direction="left" in timeout={500}>
              <Box>{getStepContent(activeStep)}</Box>
            </Slide>
          </Paper>
        </Fade>
      </Container>
    </Box>
    </Container>
  );
}

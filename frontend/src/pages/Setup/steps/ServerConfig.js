import React from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid
} from '@mui/material';

export default function ServerConfig({ config, updateConfig, onNext, onBack }) {
  const handleChange = (field) => (event) => {
    updateConfig({ [field]: event.target.value });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Server Configuration
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Configure your server settings.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Server Port"
            type="number"
            value={config.port}
            onChange={handleChange('port')}
            placeholder="3001"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Server Host"
            value={config.host}
            onChange={handleChange('host')}
            placeholder="localhost"
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" onClick={onBack}>
              Back
            </Button>
            <Button variant="contained" onClick={onNext} sx={{ flex: 1 }}>
              Continue
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

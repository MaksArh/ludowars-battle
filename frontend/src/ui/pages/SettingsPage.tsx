import { Box, Button, Paper, Slider, Stack, Switch, Typography, FormControlLabel } from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import { useSettingsStore } from '@/store/settingsStore';
import { audioService } from '@/services/AudioService';
import { PageHeader } from '@/ui/components';

export function SettingsPage() {
  const {
    masterVolume,
    sfxVolume,
    musicVolume,
    muted,
    setMasterVolume,
    setSFXVolume,
    setMusicVolume,
    toggleMute,
    resetToDefaults,
  } = useSettingsStore();

  const handleMasterChange = (_: Event, value: number | number[]) => {
    setMasterVolume((value as number) / 100);
    audioService.updateMusicVolume();
  };

  const handleSFXChange = (_: Event, value: number | number[]) => {
    setSFXVolume((value as number) / 100);
  };

  const handleMusicChange = (_: Event, value: number | number[]) => {
    setMusicVolume((value as number) / 100);
    audioService.updateMusicVolume();
  };

  const handleMuteToggle = () => {
    toggleMute();
    audioService.updateMusicVolume();
  };

  const handleReset = () => {
    audioService.playSFX('ui_click');
    resetToDefaults();
    audioService.updateMusicVolume();
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <PageHeader title="Settings" />

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          <VolumeUpIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Audio
        </Typography>

        <Stack spacing={3} sx={{ mt: 2 }}>
          <Box>
            <Typography gutterBottom>
              Master Volume: {Math.round(masterVolume * 100)}%
            </Typography>
            <Slider
              value={Math.round(masterVolume * 100)}
              onChange={handleMasterChange}
              disabled={muted}
              valueLabelDisplay="auto"
              valueLabelFormat={(v) => `${Math.round(v)}%`}
            />
          </Box>

          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography>
                SFX Volume: {Math.round(sfxVolume * 100)}%
              </Typography>
              <Button size="small" onClick={() => audioService.playSFX('ui_click')} disabled={muted}>
                Test
              </Button>
            </Box>
            <Slider
              value={Math.round(sfxVolume * 100)}
              onChange={handleSFXChange}
              disabled={muted}
              valueLabelDisplay="auto"
              valueLabelFormat={(v) => `${Math.round(v)}%`}
            />
          </Box>

          <Box>
            <Typography gutterBottom>
              <MusicNoteIcon sx={{ mr: 0.5, fontSize: 18, verticalAlign: 'middle' }} />
              Music Volume: {Math.round(musicVolume * 100)}%
            </Typography>
            <Slider
              value={Math.round(musicVolume * 100)}
              onChange={handleMusicChange}
              disabled={muted}
              valueLabelDisplay="auto"
              valueLabelFormat={(v) => `${Math.round(v)}%`}
            />
          </Box>

          <FormControlLabel
            control={<Switch checked={!muted} onChange={handleMuteToggle} />}
            label={muted ? 'Sound Muted' : 'Sound Enabled'}
          />

        </Stack>
      </Paper>

      <Button variant="outlined" color="warning" onClick={handleReset} fullWidth>
        Reset to Defaults
      </Button>
    </Box>
  );
}

import { Box, CircularProgress } from '@mui/material';

interface CenteredLoaderProps {
  size?: number;
  py?: number;
}

export function CenteredLoader({ size = 40, py = 4 }: CenteredLoaderProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py }}>
      <CircularProgress size={size} />
    </Box>
  );
}

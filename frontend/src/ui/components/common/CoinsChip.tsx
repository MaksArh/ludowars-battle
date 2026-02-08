import { Chip } from '@mui/material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

interface CoinsChipProps {
  coins: number;
  showIcon?: boolean;
}

export function CoinsChip({ coins, showIcon = true }: CoinsChipProps) {
  return (
    <Chip
      icon={showIcon ? <MonetizationOnIcon /> : undefined}
      label={`${coins} coins`}
      color="warning"
      sx={{ fontWeight: 'bold' }}
    />
  );
}

import { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';
import { BackButton } from './BackButton';

interface PageHeaderProps {
  title: string;
  backTo?: string;
  rightElement?: ReactNode;
}

export function PageHeader({ title, backTo, rightElement }: PageHeaderProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <BackButton to={backTo} />
        <Typography variant="h4" sx={{ ml: 2 }}>{title}</Typography>
      </Box>
      {rightElement}
    </Box>
  );
}

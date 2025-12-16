import { useState } from 'react';
import { Box, Button, TextField, Typography, Alert, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export interface FormField {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password';
  required?: boolean;
}

interface AuthFormProps {
  title: string;
  fields: FormField[];
  submitText: string;
  onSubmit: (data: Record<string, string>) => Promise<void>;
  error?: string | null;
  isLoading?: boolean;
  footer?: { text: string; to: string }[];
}

export function AuthForm({ title, fields, submitText, onSubmit, error, isLoading, footer }: AuthFormProps) {
  const navigate = useNavigate();
  const [values, setValues] = useState<Record<string, string>>(() =>
    fields.reduce((acc, f) => ({ ...acc, [f.name]: '' }), {})
  );

  const handleChange = (name: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({ ...prev, [name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(values);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} maxWidth={360} mx="auto">
      <Typography variant="h4" fontWeight={600} mb={3} textAlign="center">
        {title}
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {fields.map((field) => (
        <TextField
          key={field.name}
          fullWidth
          label={field.label}
          type={field.type || 'text'}
          value={values[field.name]}
          onChange={handleChange(field.name)}
          sx={{ mb: 2 }}
          required={field.required !== false}
        />
      ))}
      <Button fullWidth variant="contained" type="submit" disabled={isLoading} sx={{ mb: 2 }}>
        {submitText}
      </Button>
      {footer && footer.length > 0 && (
        <Typography textAlign="center">
          {footer.map((item, i) => (
            <span key={item.to}>
              {i > 0 && ' | '}
              <Link component="button" type="button" onClick={() => navigate(item.to)}>
                {item.text}
              </Link>
            </span>
          ))}
        </Typography>
      )}
    </Box>
  );
}

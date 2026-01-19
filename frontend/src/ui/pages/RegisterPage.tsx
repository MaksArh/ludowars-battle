import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/constants';
import { useUserStore } from '@/store';
import { AuthForm, FormField } from '@/ui/components';

const FIELDS: FormField[] = [
  { name: 'username', label: 'Username (min 2 chars)' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'password', label: 'Password (min 8 chars)', type: 'password' },
];

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading, error } = useUserStore();

  const handleSubmit = async (data: Record<string, string>) => {
    await register({ email: data.email, password: data.password, username: data.username });
    if (useUserStore.getState().isAuth) navigate(ROUTES.MENU);
  };

  return (
    <AuthForm
      title="Create Account"
      fields={FIELDS}
      submitText="Register"
      onSubmit={handleSubmit}
      error={error}
      isLoading={isLoading}
      footer={[{ text: 'Already have account?', to: ROUTES.LOGIN }]}
    />
  );
}

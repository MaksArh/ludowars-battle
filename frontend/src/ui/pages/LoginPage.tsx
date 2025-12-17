import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/constants';
import { useUserStore } from '@/store';
import { AuthForm, FormField } from '@/ui/components';

const FIELDS: FormField[] = [
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'password', label: 'Password', type: 'password' },
];

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error } = useUserStore();

  const handleSubmit = async (data: Record<string, string>) => {
    await login({ email: data.email, password: data.password });
    if (useUserStore.getState().isAuth) navigate(ROUTES.MENU);
  };

  return (
    <AuthForm
      title="Login"
      fields={FIELDS}
      submitText="Sign In"
      onSubmit={handleSubmit}
      error={error}
      isLoading={isLoading}
      footer={[
        { text: 'Create account', to: ROUTES.REGISTER },
        { text: 'Back', to: ROUTES.LANDING },
      ]}
    />
  );
}

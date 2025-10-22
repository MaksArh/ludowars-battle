import './Button.css';

export interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}

export function Button({ children, onClick, variant = 'primary', disabled = false }: ButtonProps) {
  return (
    <button className={`button button--${variant}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}


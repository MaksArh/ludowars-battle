import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../../src/components/Button';

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button onClick={() => {}}>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);

    fireEvent.click(screen.getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies correct variant class', () => {
    const { rerender } = render(<Button onClick={() => {}} variant="primary">Button</Button>);
    expect(screen.getByRole('button')).toHaveClass('button--primary');

    rerender(<Button onClick={() => {}} variant="secondary">Button</Button>);
    expect(screen.getByRole('button')).toHaveClass('button--secondary');

    rerender(<Button onClick={() => {}} variant="danger">Button</Button>);
    expect(screen.getByRole('button')).toHaveClass('button--danger');
  });

  it('disables button when disabled prop is true', () => {
    render(<Button onClick={() => {}} disabled>Disabled Button</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('does not call onClick when disabled', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick} disabled>Disabled Button</Button>);

    fireEvent.click(screen.getByText('Disabled Button'));
    expect(handleClick).not.toHaveBeenCalled();
  });
});



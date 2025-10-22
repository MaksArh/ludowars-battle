import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Counter } from '../../src/components/Counter';

describe('Counter Component', () => {
  it('renders counter with value 0', () => {
    render(<Counter count={0} />);
    expect(screen.getByTestId('counter-value')).toHaveTextContent('0');
  });

  it('renders counter with positive value', () => {
    render(<Counter count={42} />);
    expect(screen.getByTestId('counter-value')).toHaveTextContent('42');
  });

  it('renders counter with negative value', () => {
    render(<Counter count={-10} />);
    expect(screen.getByTestId('counter-value')).toHaveTextContent('-10');
  });

  it('displays label text', () => {
    render(<Counter count={5} />);
    expect(screen.getByText('Count:')).toBeInTheDocument();
  });
});


import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HelloWorld } from '../../src/components/HelloWorld';

describe('HelloWorld', () => {
  it('renders with default name', () => {
    render(<HelloWorld />);
    expect(screen.getByText('Greetings, World!')).toBeInTheDocument();
  });

  it('renders with custom name', () => {
    render(<HelloWorld name="Ludowars" />);
    expect(screen.getByText('Greetings, Ludowars!')).toBeInTheDocument();
  });

  it('renders demo description', () => {
    render(<HelloWorld />);
    expect(screen.getByText('This component is for testing purposes.')).toBeInTheDocument();
  });
});


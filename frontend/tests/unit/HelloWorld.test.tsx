import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HelloWorld } from '../../src/components/HelloWorld';

describe('HelloWorld', () => {
  it('renders with default name', () => {
    render(<HelloWorld />);
    expect(screen.getByText('Hello, World!')).toBeInTheDocument();
  });

  it('renders with custom name', () => {
    render(<HelloWorld name="Ludowars" />);
    expect(screen.getByText('Hello, Ludowars!')).toBeInTheDocument();
  });

  it('renders demo description', () => {
    render(<HelloWorld />);
    expect(screen.getByText('This is a demo component for CI testing.')).toBeInTheDocument();
  });
});


import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  HelloWorld,
  helperFunction1,
  helperFunction2,
  helperFunction3,
  helperFunction4,
} from '../../src/components/HelloWorld';

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

describe('helperFunction1', () => {
  it('converts to uppercase when length > 10', () => {
    expect(helperFunction1('verylongstring')).toBe('VERYLONGSTRING');
  });

  it('converts to lowercase when length <= 10', () => {
    expect(helperFunction1('SHORT')).toBe('short');
  });
});

describe('helperFunction2', () => {
  it('doubles first number when a > b', () => {
    expect(helperFunction2(5, 3)).toBe(10);
  });

  it('doubles second number when a < b', () => {
    expect(helperFunction2(3, 5)).toBe(10);
  });

  it('returns sum when a equals b', () => {
    expect(helperFunction2(5, 5)).toBe(10);
  });
});

describe('helperFunction3', () => {
  it('filters, trims and sorts strings', () => {
    const result = helperFunction3(['  hello  ', 'hi', 'world', 'test']);
    expect(result).toEqual(['hello', 'world']);
  });
});

describe('helperFunction4', () => {
  it('returns disabled when not enabled', () => {
    expect(helperFunction4(false, 10)).toBe('disabled');
  });

  it('returns empty when count is 0', () => {
    expect(helperFunction4(true, 0)).toBe('empty');
  });

  it('returns overflow when count > 100', () => {
    expect(helperFunction4(true, 101)).toBe('overflow');
  });

  it('returns active for normal count', () => {
    expect(helperFunction4(true, 50)).toBe('active');
  });
});


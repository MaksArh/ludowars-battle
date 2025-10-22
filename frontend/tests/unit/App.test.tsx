import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../../src/App';

describe('App Component', () => {
  it('renders app title', () => {
    render(<App />);
    expect(screen.getByText('Ludowars Battle')).toBeInTheDocument();
  });

  it('renders description', () => {
    render(<App />);
    expect(screen.getByText('2D Multiplayer Platform Shooter')).toBeInTheDocument();
  });

  it('increments counter when increment button is clicked', () => {
    render(<App />);
    const incrementButton = screen.getByText('Increment');

    fireEvent.click(incrementButton);
    expect(screen.getByTestId('counter-value')).toHaveTextContent('1');

    fireEvent.click(incrementButton);
    expect(screen.getByTestId('counter-value')).toHaveTextContent('2');
  });

  it('decrements counter when decrement button is clicked', () => {
    render(<App />);
    const decrementButton = screen.getByText('Decrement');

    fireEvent.click(decrementButton);
    expect(screen.getByTestId('counter-value')).toHaveTextContent('-1');

    fireEvent.click(decrementButton);
    expect(screen.getByTestId('counter-value')).toHaveTextContent('-2');
  });

  it('resets counter when reset button is clicked', () => {
    render(<App />);

    // Increment a few times
    const incrementButton = screen.getByText('Increment');
    fireEvent.click(incrementButton);
    fireEvent.click(incrementButton);
    fireEvent.click(incrementButton);

    expect(screen.getByTestId('counter-value')).toHaveTextContent('3');

    // Reset
    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);

    expect(screen.getByTestId('counter-value')).toHaveTextContent('0');
  });

  it('renders all three buttons', () => {
    render(<App />);
    expect(screen.getByText('Increment')).toBeInTheDocument();
    expect(screen.getByText('Decrement')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
  });
});


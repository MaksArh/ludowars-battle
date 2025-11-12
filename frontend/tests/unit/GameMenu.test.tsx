import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GameMenu } from '../../src/components/GameMenu';

describe('GameMenu', () => {
  it('renders main menu heading', () => {
    render(<GameMenu />);
    expect(screen.getByText('Main Menu')).toBeInTheDocument();
  });

  it('renders Start Game button', () => {
    render(<GameMenu />);
    expect(screen.getByText('Start Game')).toBeInTheDocument();
  });

  it('renders Settings button', () => {
    render(<GameMenu />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('calls onStartGame when Start Game button is clicked', () => {
    const onStartGame = vi.fn();
    render(<GameMenu onStartGame={onStartGame} />);
    
    fireEvent.click(screen.getByText('Start Game'));
    expect(onStartGame).toHaveBeenCalledTimes(1);
  });

  it('calls onShowSettings when Settings button is clicked', () => {
    const onShowSettings = vi.fn();
    render(<GameMenu onShowSettings={onShowSettings} />);
    
    fireEvent.click(screen.getByText('Settings'));
    expect(onShowSettings).toHaveBeenCalledTimes(1);
  });

  it('works without callbacks', () => {
    render(<GameMenu />);
    
    // Should not throw errors when clicking without callbacks
    fireEvent.click(screen.getByText('Start Game'));
    fireEvent.click(screen.getByText('Settings'));
  });
});


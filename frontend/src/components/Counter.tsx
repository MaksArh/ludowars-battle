import './Counter.css';

export interface CounterProps {
  count: number;
}

export function Counter({ count }: CounterProps) {
  return (
    <div className="counter">
      <p className="counter__label">Count:</p>
      <p className="counter__value" data-testid="counter-value">
        {count}
      </p>
    </div>
  );
}


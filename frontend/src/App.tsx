import { useState } from 'react';
import './App.css';
import { Button } from './components/Button';
import { Counter } from './components/Counter';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="app">
      <h1>Ludowars Battle</h1>
      <p className="description">2D Multiplayer Platform Shooter</p>

      <Counter count={count} />

      <div className="button-group">
        <Button onClick={() => setCount((c) => c + 1)} variant="primary">
          Increment
        </Button>
        <Button onClick={() => setCount((c) => c - 1)} variant="secondary">
          Decrement
        </Button>
        <Button onClick={() => setCount(0)} variant="danger">
          Reset
        </Button>
      </div>
    </div>
  );
}

export default App;

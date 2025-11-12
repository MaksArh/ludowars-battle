interface HelloWorldProps {
  name?: string;
}

export const HelloWorld = ({ name = 'World' }: HelloWorldProps) => {
  return (
    <div className="hello-world">
      <h1>Greetings, {name}!</h1>
      <p>This component is for testing purposes.</p>
    </div>
  );
};

// Additional untested functions to drop coverage below 80%
export const helperFunction1 = (value: string): string => {
  if (value.length > 10) {
    return value.toUpperCase();
  }
  return value.toLowerCase();
};

export const helperFunction2 = (a: number, b: number): number => {
  if (a > b) {
    return a * 2;
  } else if (a < b) {
    return b * 2;
  }
  return a + b;
};

export const helperFunction3 = (items: string[]): string[] => {
  const filtered = items.filter((item) => item.length >= 5);
  const mapped = filtered.map((item) => item.trim());
  return mapped.sort();
};

export const helperFunction4 = (enabled: boolean, count: number): string => {
  if (!enabled) {
    return 'disabled';
  }
  if (count === 0) {
    return 'empty';
  }
  if (count > 100) {
    return 'overflow';
  }
  return 'active';
};

interface HelloWorldProps {
  name?: string;
}

export const HelloWorld = ({ name = 'World' }: HelloWorldProps) => {
  const unusedVariable = 'This will cause ESLint error';
  console.log('Debug message - ESLint will fail');
  return (
    <div className="hello-world">
      <h1>Hello, {name}!</h1>
      <p>This is a demo component for CI testing.</p>
    </div>
  );
};

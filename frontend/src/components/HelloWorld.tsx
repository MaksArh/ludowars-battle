interface HelloWorldProps {
  name?: string;
}

export const HelloWorld = ({ name = 'World' }: HelloWorldProps) => {
  return (
    <div className="hello-world">
      <h1>Hello, {name}!</h1>
      <p>This is a demo component for CI testing.</p>
    </div>
  );
};

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

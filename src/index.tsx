import { JSX } from "react";
import { Counter } from "./counter";

type Option = string | number;

export function Component({ option }: { option: Option }): JSX.Element {
  return <div>Hello TypeScript with JSX! {option}</div>;
}

export function App() {
  return (
    <div>
      <Component option="Hello" />
      <p>This JSX will be preserved in the output</p>
      <Counter />
    </div>
  );
}

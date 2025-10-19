const {
  Counter
} = await dc.require("./counter");
function Component({
  option
}) {
  return <div>Hello TypeScript with JSX! {option}</div>;
}
function App() {
  return <div>
      <Component option="Hello" />
      <p>This JSX will be preserved in the output</p>
      <Counter />
    </div>;
}
return {
  Component,
  App
};
export function Component({ option }) {
    return <div>Hello TypeScript with JSX! {option}</div>;
}
export function App() {
    return (<div>
      <Component option="Hello"/>
      <p>This JSX will be preserved in the output</p>
    </div>);
}

function Counter() {
  const [count, setCount] = dc.useState(0);
  dc.useEffect(() => {
    console.log('Count changed:', count);
  }, [count]);
  return <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>;
}
return {
  Counter
};
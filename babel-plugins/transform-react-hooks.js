module.exports = function ({ types: t }) {
  // List of React hooks and other common React functions
  const reactIdentifiers = [
    'useState',
    'useEffect',
    'useContext',
    'useReducer',
    'useCallback',
    'useMemo',
    'useRef',
    'useImperativeHandle',
    'useLayoutEffect',
    'useDebugValue',
    'useDeferredValue',
    'useTransition',
    'useId',
    'useSyncExternalStore',
    'useInsertionEffect',
    'createElement',
    'Fragment',
    'Component',
    'PureComponent',
    'createContext',
    'forwardRef',
    'lazy',
    'memo',
    'startTransition',
    'createRef'
  ];

  return {
    name: 'transform-react-hooks',
    visitor: {
      // Transform identifiers like useState to dc.useState
      Identifier(path) {
        const name = path.node.name;

        // Skip if this identifier is already part of dc.something
        if (t.isMemberExpression(path.parent) && path.parent.property === path.node) {
          return;
        }

        // Skip if this is a property key
        if (t.isObjectProperty(path.parent) && path.parent.key === path.node && !path.parent.computed) {
          return;
        }

        // Skip if this is a function/class/variable declaration name
        if (t.isFunctionDeclaration(path.parent) && path.parent.id === path.node) {
          return;
        }
        if (t.isClassDeclaration(path.parent) && path.parent.id === path.node) {
          return;
        }
        if (t.isVariableDeclarator(path.parent) && path.parent.id === path.node) {
          return;
        }

        // Skip if this is being declared (function parameter, variable declaration, etc.)
        if (path.scope.hasOwnBinding(name)) {
          return;
        }

        // Check if it's a React identifier
        if (reactIdentifiers.includes(name)) {
          // Replace with dc.identifier
          path.replaceWith(
            t.memberExpression(
              t.identifier('dc'),
              t.identifier(name)
            )
          );
        }
      },
    },
  };
};

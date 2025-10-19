module.exports = {
  presets: [
    ['@babel/preset-typescript', {
      isTSX: true,
      allExtensions: true,
      onlyRemoveTypeImports: true
    }]
  ],
  plugins: [
    './babel-plugins/transform-imports-exports.js',
    './babel-plugins/transform-react-hooks.js'
  ]
};

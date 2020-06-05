// Inspired by https://github.com/tbranyen/babel-plugin-resolve-imports-for-browser
// Modified by zhoukekestar @ 20200605

const { types } = require('@babel/core');

let pluginOptions = {}

const visitor = {
  exit(path) {
    const { specifiers } = path.node;
    const source = path.get('source');

    if (!source.node) {
      return;
    }

    // If dep is a thrid lib, convert it to cdn.
    if (source.node.value[0] !== '.' && source.node.value[0] !== '/') {

      // Map to new resource
      if (pluginOptions[source.node.value]) {
        const newSource = types.stringLiteral(pluginOptions[source.node.value]);
        source.replaceWith(newSource);
      }
    }
  },
};

// Babel Plugin
module.exports = options => {
  pluginOptions = options

  return (api, options) => {
    api.assertVersion(7);

    return {
      visitor: {
        Program: {
          exit(path) {
            path.traverse({
              ImportDeclaration: visitor,
              // ExportDeclaration: visitor,
            });
          }
        },
      },
    };
  };
}

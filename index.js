const { default: traverseAst } = require('@babel/traverse');
const { transformAsync } = require('@babel/core');

const plugin = require('./babel-plugin.js');

// Snowpack Plugin
module.exports = function (snowpackConfig, pluginOptions) {
  
  const extensions = pluginOptions.extensions || ['.js', '.jsx','.tsx', '.ts']; // extensions.
  const dev = pluginOptions.dev || false; // for debugging improvements in development.
  const imports = pluginOptions.imports || {};

  return {
    async transform(options) {
      
      const { contents, filePath, isDev, fileExt } = options;

      if (!(isDev === true && dev === true) &&
        extensions.includes(fileExt.toLowerCase())) {
        const result = await transformAsync(contents, {
          filename: filePath,
          plugins: [plugin(imports)],
          cwd: process.cwd(),
          ast: false,
        });
        return result.code;
      }
      return contents;
    },
  };
};
const { default: traverseAst } = require('@babel/traverse');
const { transformAsync } = require('@babel/core');

const plugin = require('./babel-plugin.js');

// Snowpack Plugin
module.exports = function (snowpackConfig, pluginOptions) {

  return {

    // build source with babel
    async build(options) {
      const { contents, filePath, isDev } = options;

      const result = await transformAsync(contents, {
        filename: filePath,
        plugins: [plugin(pluginOptions)],
        cwd: process.cwd(),
        ast: false,
      });

      let code = result.code;

      return {
        result: code,
      }
    },
  };
};
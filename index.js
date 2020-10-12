const path = require("path");
const { createRequire } = require("module");
const esmImportRegex = require("./esmImportRegex.js");
const cwdPkgJson = path.join(process.cwd(), "package.json");
const topLevelRequire = createRequire(cwdPkgJson);

// Snowpack Plugin
module.exports = function (snowpackConfig, pluginOptions) {
  const extensions = pluginOptions.extensions || [".js", ".jsx", ".tsx", ".ts"]; // extensions.
  const dev = pluginOptions.dev || false; // for debugging improvements in development.
  let imports = pluginOptions.imports || {};

  // Treat imports: { "*": true } as if all of the top-level dependencies are set to true, to auto-load from cdn.
  // Disable certain dependencies by setting them to false or another string.
  if (imports["*"] === true) {
    delete imports["*"];
    imports = {
      ...Object.keys(require(cwdPkgJson).dependencies || {}).reduce(
        (acc, dep) => {
          acc[dep] = true;
          return acc;
        },
        {}
      ),
      ...imports,
    };
  }

  if (Object.keys(imports).length === 0) {
    return {};
  }

  // Store package versions so the version is only resolved once
  const cache = new Map();

  return {
    name: "snowpack-plugin-import-map",
    async transform({ contents, isDev, fileExt }) {
      if ((!isDev || dev) && extensions.includes(fileExt.toLowerCase())) {
        contents = contents.replace(
          esmImportRegex,
          (_, before, source, after) => {
            const newSource = rewriteImport(source, imports, cache, isDev);
            return `${before}${newSource}${after}`;
          }
        );
      }
      return contents;
    },
  };
};

function rewriteImport(source, imports, cache, isDev) {
  if (imports.hasOwnProperty(source)) {
    if (typeof imports[source] === "string") {
      // If the import option is a string, rewrite the import to be the string value
      return imports[source];
    } else if (imports[source] === true) {
      // If the import is true, detect the version of the package, and replace the import with
      // an import of the same version from cdn.skypack.dev.
      let cached = cache.get(source);
      if (cached) {
        return cached;
      }

      let version = getVersionForPackage(source);
      if (version) {
        version = `@${version}`;
      }
      const cdnUrl = `https://cdn.skypack.dev/${source}${version}${
        isDev ? "" : "?min"
      }`;
      cache.set(source, cdnUrl);
      return cdnUrl;
    }
  }
  return source;
}

function getVersionForPackage(source) {
  let version;
  try {
    // Get the exact version of the package, if possible, by reading its package.json file.
    const sourcePkgJson = topLevelRequire(`${source}/package.json`);
    version = sourcePkgJson.version;
  } catch (e) {}

  if (!version) {
    try {
      // Get the version range from the top level package json for this package.
      version = (require(cwdPkgJson).dependencies || {})[source];
      if (version && version.test(/^[a-z]+:/) && !version.startsWith("npm:")) {
        // If the package is a 'file:', 'link:', 'workspace:', etc. dependency, ignore
        version = "";
      }
    } catch (e) {}
  }
  return version || "";
}

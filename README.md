# snowpack-plugin-import-map

A snowpack plugin that maps your imports to Skypack or other sources.

[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard)

## Installation

```bash
npm install --save-dev snowpack-plugin-import-map
yarn add --dev snowpack-plugin-import-map
```

## Quick Start

**Step 1:** Modify your snowpack config to include the 'snowpack-plugin-import-map' plugin:

```js
module.exports = {
  extends: "@snowpack/app-scripts-react",
  plugins: [
    [
      "snowpack-plugin-import-map",
      {
        // map of packages to imports (required)
        imports: {
          // import the currently installed version of react-dom from cdn.skypack.dev
          "react-dom": true,
          // specify the exact URL to load the dependency from
          react: "https://cdn.skypack.dev/react@^16.13.1",

          // Or, import all top-level dependencies from cdn.skypack.dev
          "*": true,
          // (with one exception)
          "a-package": false,
        },
        // if true, import-map transforms imports in development mode too. default: false.
        dev: true,
        // supported extensions. default: ['.js', '.jsx','.tsx', '.ts']
        extensions: [".js", ".jsx", ".tsx", ".ts"],
        // use custom cdn URL builder instead of Skypack.
        getCdnURL: (source, version, isDev) => {
          return `https://cdnjs.cloudflare.com/ajax/libs/${source}/${version.replace(/[^\d.]/g, '')}/umd/${source}.production${isDev ? ".min" : ""}.js`
        }
      },
    ],
  ],
};
```

> Note: we don't recommend using this plugin for mapping one package name to another.
> For that, Snowpack has [import aliases](https://www.snowpack.dev/#import-aliases)
> built in.

> Note: if you use custom cdn URL builder, some CDN providers may not handle
> your package, so you must check the existence of the package yourself.

**Step 2:** `npx snowpack build` or `npx snowpack dev`

Transforms this:

```js
// Before
import React from "react";
import ReactDOM from "react-dom";

ReactDOM.render(
  <h1>Hello world!</h1>,
  document.getElementById("root")
);
```

Into this, which can be run directly in the browser without web_modules deps.

```js
// After
import React from "https://cdn.skypack.dev/react@^16.13.1";
import ReactDOM from "https://cdn.skypack.dev/react-dom@^16.13.1";

ReactDOM.render(
  React.createElement("h1", null, "Hello world!"),
  document.getElementById("root")
);
```

[Skypack](https://www.skypack.dev/) offers blazing fast downloads and
great caching, so it will most likely improve your website's loading
time. Packages you import from Skypack are optimized for the
user's exact browser, so modern browsers load less code.

Offloading your dependencies to a CDN also reduces the amount of code
your server has to serve—**reducing your costs!** If you import all
dependencies from Skypack, your server will only have to supply
your source files. This makes it much easier to deploy your application
to a CDN 🎉

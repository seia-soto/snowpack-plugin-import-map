# snowpack-plugin-import-map
snowpack-plugin-import-map


## Modify your snowpack config

```js
module.exports = {
  "extends": "@snowpack/app-scripts-react",
  "scripts": {
    "build:js,jsx,ts,tsx": 'snowpack-plugin-import-map'
  },
  "plugins": [
    ['snowpack-plugin-import-map', {
      react: 'https://cdn.pika.dev/react@^16.13.1',
      'react-dom': 'https://cdn.pika.dev/react-dom@^16.13.1',
    }]]
}
```

And you will get result like this which can run in browser directly without web-modules deps.

```js

import React from "https://cdn.pika.dev/react@^16.13.1";
import ReactDOM from "https://cdn.pika.dev/react-dom@^16.13.1";

ReactDOM.render(
  React.createElement("p", null, "hello world!"),
  document.getElementById('root')
);

```
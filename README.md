# snowpack-plugin-import-map
A snowpack plugin that modify your import resource by given map.

## Quick Start

Step 1: Write your React code as usually like this:

```jsx
import React from 'react';
import ReactDOM from 'react-dom';

ReactDOM.render(
  <h1>Hello world!</h1>,
  document.getElementById('root'),
);

```

Step 2: Modify your snowpack config

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

Step 3: `npx snowpack build` or `npx snowpack dev`

And you will get result like this which can run in browser directly without web-modules deps.

```js
import React from "https://cdn.pika.dev/react@^16.13.1";
import ReactDOM from "https://cdn.pika.dev/react-dom@^16.13.1";

ReactDOM.render(
  React.createElement("h1", null, "Hello world!"),
  document.getElementById('root')
);
```

One more thing, you can deploy it to CDN smoothly ~~~ 🎉
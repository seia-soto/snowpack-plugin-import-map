const plugin = require(".");
const esmImportRegex = require("./esmImportRegex.js");

// A real package is required to be a dependency for this test to work. Using is-number.
const isNumberVersion = require("is-number/package.json").version;

const contents = `
import isNumber from "is-number";
import React from "react";
console.log(isNumber("5"));
`;
const expected = ({
  min = true,
  isNumber = `https://cdn.skypack.dev/is-number@${isNumberVersion}${
    min ? "?min" : ""
  }`,
} = {}) => `
import isNumber from "${isNumber}";
import React from "react";
console.log(isNumber("5"));
`;
const fileExt = ".js";

test("does nothing with empty config", async () => {
  const instance = plugin({}, {});
  const result = instance.transform
    ? await instance.transform({ contents, fileExt, isDev: false })
    : contents;
  expect(result).toEqual(contents);
});

test("does nothing when fileExt doesn't match", async () => {
  const instance1 = plugin(
    {},
    {
      imports: {
        "is-number": `https://cdn.skypack.dev/is-number`,
      },
    }
  );
  const instance2 = plugin(
    {},
    {
      imports: {
        "is-number": `https://cdn.skypack.dev/is-number`,
      },
      extensions: [".ts"],
    }
  );
  const result1 = await instance1.transform({
    contents,
    fileExt: ".zz",
    isDev: false,
  });
  expect(result1).toEqual(contents);
  const result2 = await instance2.transform({
    contents,
    fileExt: ".js",
    isDev: false,
  });
  expect(result2).toEqual(contents);
});

test("rewrites imports given in the 'imports' plugin option", async () => {
  const instance = plugin(
    {},
    {
      imports: {
        "is-number": `https://cdn.skypack.dev/is-number`,
      },
    }
  );
  const result = await instance.transform({
    contents,
    fileExt,
    isDev: false,
  });
  expect(result).toEqual(
    expected({ isNumber: `https://cdn.skypack.dev/is-number` })
  );
});

test("resolves 'imports' plugin options set to true", async () => {
  const instance = plugin({}, { imports: { "is-number": true } });
  const result = await instance.transform({
    contents,
    fileExt,
    isDev: false,
  });
  expect(result).toEqual(expected());
});

test("resolves 'imports': { '*': true }", async () => {
  const instance = plugin({}, { imports: { "*": true } });
  const result = await instance.transform({
    contents,
    fileExt,
    isDev: false,
  });
  expect(result).toEqual(expected());
});

test("runs in development mode with dev option set", async () => {
  const instance1 = plugin({}, { dev: false, imports: { "is-number": true } });
  const instance2 = plugin({}, { dev: true, imports: { "is-number": true } });
  const result1 = await instance1.transform({
    contents,
    fileExt,
    isDev: true,
  });
  const result2 = await instance2.transform({
    contents,
    fileExt,
    isDev: true,
  });
  expect(result1).toEqual(contents);
  expect(result2).toEqual(expected({ min: false }));
});

test("regex", () => {
  const shouldPass = `
    import defaultExport from "module-name";
    import * as name from "module-name";
    import { export1 } from "module-name";
    import { export1 as alias1 } from "module-name";
    import { export1, export2 } from "module-name";
    import { export1, export2 as alias2 } from "module-name";
    import defaultExport, { export1, export2 } from "module-name";
    import defaultExport, * as name from "module-name";
    import "module-name";
    var promise = import("module-name");
  `
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  for (const line of shouldPass) {
    const match = esmImportRegex.exec(line);
    esmImportRegex.lastIndex = 0;
    expect(match).toBeTruthy();
    expect(match[2]).toBe("module-name");
  }

  const shouldFail = `
    import;
    import from "module-name";
    from "module-name";
    import "./module-name";
    import "module-name.js";
    import { foo } from "module-name/path/to/un-exported/file.js";
    var promise = import("./module-name");
  `
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  for (const line of shouldFail) {
    const match = esmImportRegex.exec(line);
    esmImportRegex.lastIndex = 0;
    expect(match).toBeFalsy();
  }
});

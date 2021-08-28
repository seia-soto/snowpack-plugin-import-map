// Matches any ES6 import and returns 3 groups: everything up to the module name, the module name, and anything after.
// It only matches package imports, not relative or absolute imports.
const esmImportRegex = /(import[\s(]*(?:(?:[\w{}[\]*]+(?:[\w,{}[\]* ]+)?)[\s]*from[\s]*)?["'])([@\w-]+(?:[/.]*[\w-./]+)?)(["'](?:[)])?)/gm

export = esmImportRegex

# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [2.1.0](https://github.com/seia-soto/snowpack-plugin-import-map/compare/v2.0.0...v2.1.0) (2023-01-12)

## [2.0.0](https://github.com/Seia-Soto/snowpack-plugin-import-map/compare/v1.2.0...v2.0.0) (2023-01-12)


### Features

* use modern stack ([a1ddc68](https://github.com/Seia-Soto/snowpack-plugin-import-map/commit/a1ddc68f9c2c3970f5e46c167eb17626613038e8))

### [1.2.1](https://github.com/Seia-Soto/snowpack-plugin-import-map/compare/v1.2.0...v1.2.1) (2023-01-12)

## 1.2.0 (2021-08-28)


### Features

* move to typescript ([2d4491d](https://github.com/Seia-Soto/snowpack-plugin-import-map/commit/2d4491dfd78cf74327538cbec3d6b90f19a56c40))
* move to yarn berry ([98fec16](https://github.com/Seia-Soto/snowpack-plugin-import-map/commit/98fec16cd1eeba15400de89cffdb81d44edf9648))


### Bug Fixes

* tsconfig error ([afb1912](https://github.com/Seia-Soto/snowpack-plugin-import-map/commit/afb19120fedff22dd9d7f73f96244d3f8d037a2e))

## [1.1.0] - 2020-10-09

### Added

- Set an import option to `true` to detect the version of the currently installed top-level dependency version.
  Imports to this dependency will be replaced with an import to the Skypack CDN.
- Set the import option field `"*"` to `true` to replace imports to all of the top-dependencies with imports
  to the Skypack CDN. Disable specific dependencies by setting them to `false`.
- Added a test suite and CI.

### Changed

- Improved speed by replacing full Babel passes with a sophisticated regex; handles static and dynamic imports.
- README.md changes.

## [1.1.2] - 2020-12-13

### Added

- Use eslint-standard as JavaScript linter and imported jest as eslint plugin for test code.

### Changed

- Improved esmImportRegex.js for some missed cases.
  For example, the expression didn't catch package name which has two or more slashes from import statement.

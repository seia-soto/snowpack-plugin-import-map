# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

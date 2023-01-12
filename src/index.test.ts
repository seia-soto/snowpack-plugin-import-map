import test from 'ava';
import esmImportRegex from './esmImportRegex.js';
import plugin from './index.js';
import {type BuildCdnUrlFunction, type SamplePackage} from './types.js';
import isNumberPackageContent from 'is-number/package.json' assert { type: 'json' };

const contents = `
import isNumber from "is-number"
import React from "react"
console.log(isNumber("5"))
`;
const fileExt = '.js';

const expected = (shouldUseFollowingCdnUrl?: string, shouldUseMinimalVersion = true) => `
import isNumber from "${shouldUseFollowingCdnUrl ?? `https://cdn.skypack.dev/is-number@${isNumberPackageContent.version}${shouldUseMinimalVersion ? '?min' : ''}`}"
import React from "react"
console.log(isNumber("5"))
`;

test('does nothing with empty config', async t => {
	const instance = plugin({}, {});
	const fileExt = '.js';
	const result = instance.transform
		? await instance.transform({contents, fileExt, isDev: false})
		: contents;

	t.is(result, contents);
});

test('does nothing when fileExt doesn\'t match', async t => {
	const instance1 = plugin(
		{},
		{
			imports: {
				'is-number': 'https://cdn.skypack.dev/is-number',
			},
		},
	);
	const instance2 = plugin(
		{},
		{
			imports: {
				'is-number': 'https://cdn.skypack.dev/is-number',
			},
			extensions: ['.ts'],
		},
	);
	const result1 = await instance1.transform({
		contents,
		fileExt: '.zz',
		isDev: false,
	});

	t.is(result1, contents);

	const result2 = await instance2.transform({
		contents,
		fileExt: '.js',
		isDev: false,
	});

	t.is(result2, contents);
});

test('rewrites imports given in the \'imports\' plugin option', async t => {
	const instance = plugin(
		{},
		{
			imports: {
				'is-number': 'https://cdn.skypack.dev/is-number',
			},
		},
	);
	const result = await instance.transform({
		contents,
		fileExt,
		isDev: false,
	});

	t.is(result, expected('https://cdn.skypack.dev/is-number', false));
});

test('resolves \'imports\' plugin options set to true', async t => {
	const instance = plugin({}, {imports: {'is-number': true}});
	const result = await instance.transform({
		contents,
		fileExt,
		isDev: false,
	});

	t.is(result, expected());
});

test('resolves \'imports\': { \'*\': true }', async t => {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	const instance = plugin({}, {imports: {'*': true}});
	const result = await instance.transform({
		contents,
		fileExt,
		isDev: false,
	});

	t.is(result, expected());
});

test('runs in development mode with dev option set', async t => {
	const instance1 = plugin({}, {dev: false, imports: {'is-number': true}});
	const instance2 = plugin({}, {dev: true, imports: {'is-number': true}});
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

	t.is(result1, contents);
	t.is(result2, expected(undefined, false));
});

test('executes custom getCdnURL function properly', async t => {
	const getCdnUrl: BuildCdnUrlFunction = (source, version, isDev) => `https://cdnjs.cloudflare.com/ajax/libs/${source}/${version.replace(/[^\d.]/g, '')}/umd/${source}.production${isDev ? '.min' : ''}.js`;
	const expectedCustom = (isNumber: string) => `
import isNumber from "${isNumber}"
import React from "react"
console.log(isNumber("5"))
`;
	const instance = plugin({}, {imports: {'is-number': true}, getCdnUrl});
	const result = await instance.transform({
		contents,
		fileExt,
		isDev: false,
	});

	t.is(result, expectedCustom(getCdnUrl('is-number', isNumberPackageContent.version)));
});

test('regex', t => {
	const shouldPass = `
    import defaultExport from "module-name"
    import * as name from "module-name"
    import { export1 } from "module-name"
    import { export1 as alias1 } from "module-name"
    import { export1, export2 } from "module-name"
    import { export1, export2 as alias2 } from "module-name"
    import defaultExport, { export1, export2 } from "module-name"
    import defaultExport, * as name from "module-name"
    import "module-name"
    var promise = import("module-name")
    import defaultExport from "module-name/from/unexpected/path"
    import defaultExport from "module-name/from/unexpected/path.js"
    import "module-name.css"
  `
		.split('\n')
		.map(s => s.trim())
		.filter(Boolean);

	for (const line of shouldPass) {
		const match = esmImportRegex.exec(line) ?? [];
		esmImportRegex.lastIndex = 0;

		t.truthy(match.length);
		t.is(true, [
			'module-name',
			'module-name/from/unexpected/path',
			'module-name/from/unexpected/path.js',
			'module-name.css',
		].includes(match[2]));
	}

	const shouldFail = `
    import
    import from "module-name"
    from "module-name"
    "module-name"
    import from
    import "./module-name"
    import "../module-name"
    import "../../module-name"
    import "./module-name.js"
    import "../module-name.js"
    import "../../module-name.js"
    import "@author/@author"
    import , from "module-name"
    var promise = import("./module-name")
    import ""
  `
		.split('\n')
		.map(s => s.trim())
		.filter(Boolean);

	for (const line of shouldFail) {
		const match = esmImportRegex.exec(line);
		esmImportRegex.lastIndex = 0;

		t.falsy(match);
	}
});

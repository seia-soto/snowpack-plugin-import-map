import {createRequire} from 'module';
import * as path from 'path';
import type {SnowpackConfig} from 'snowpack';
import esmImportRegex from './esmImportRegex.js';
import {
	type BuildCdnUrlFunction, type Cache,
	type ImportOptions,
	type PluginOptions, type SamplePackage, type SnowpackTransformOptions,
} from './types';
const cwdPkgJson = path.join(process.cwd(), 'package.json');
const staticRequire = createRequire(import.meta.url);

// Snowpack Plugin
export default function (_snowpackConfig: SnowpackConfig | Record<string, unknown>, pluginOptions: PluginOptions) {
	const extensions = pluginOptions.extensions ?? ['.js', '.jsx', '.tsx', '.ts']; // Extensions.
	const dev = pluginOptions.dev ?? false; // For debugging improvements in development.
	let imports = pluginOptions.imports ?? {};

	// Treat imports: { "*": true } as if all of the top-level dependencies are set to true, to auto-load from cdn.
	// Disable certain dependencies by setting them to false or another string.
	if (imports['*'] === true) {
		delete imports['*'];

		imports = {
			...Object.keys(staticRequire(cwdPkgJson).dependencies || {}).reduce(
				(acc: Record<string, boolean>, dependency: string) => {
					acc[dependency] = true;

					return acc;
				},
				{},
			),
			...imports,
		};
	}

	if (Object.keys(imports).length === 0) {
		return { // Fallback for type-safe code
			name: 'snowpack-plugin-import-map',
			async transform({contents}: SnowpackTransformOptions) {
				return contents;
			},
		};
	}

	// Store package versions so the version is only resolved once
	const cache: Cache = {};

	// Check if pluginOptions.getCdnURL is function
	let buildCdnUrl: BuildCdnUrlFunction = getSkypackCdnUrl;

	if (typeof pluginOptions.getCdnUrl === 'function') {
		buildCdnUrl = pluginOptions.getCdnUrl;
	}

	return {
		name: 'snowpack-plugin-import-map',
		async transform({contents, isDev, fileExt}: SnowpackTransformOptions): Promise<string> {
			if ((!isDev || dev) && extensions.includes(fileExt.toLowerCase())) {
				contents = contents.replace(
					esmImportRegex,
					(_, before: string, source: string, after: string) => {
						const newSource = rewriteImport({source, imports, cache, isDev, buildCdnUrl});

						return `${before}${newSource}${after}`;
					},
				);
			}

			return contents;
		},
	};
}

/**
 * Rewrite import to CDN url
 * @returns The URL to CDN of package or package name unless available
 */
function rewriteImport({
	source,
	imports,
	cache,
	isDev,
	buildCdnUrl,
}: {
	source: string;
	imports: ImportOptions;
	cache: Cache;
	isDev: boolean;
	buildCdnUrl: BuildCdnUrlFunction;
}): string {
	const opt = imports[source];

	if (!opt) { // If `opt` is negative
		return source;
	}

	if (typeof opt === 'string') {
		// If the import option is a string, rewrite the import to be the string value
		return opt;
	}

	if (opt) {
		// If the import is true, detect the version of the package, and replace the import with
		// an import of the same version from cdn.skypack.dev.
		const cached = cache[source];

		if (cached) {
			return cached;
		}

		const version = getVersionForPackage(source);
		const cdnUrl = buildCdnUrl(source, version, isDev);

		cache[source] = cdnUrl;

		return cdnUrl;
	}

	return source;
}

/**
 * Generate CDN url to Skypack
 *
 * @param source The package name
 * @param version The version of package
 * @param isDev True if result shouldn't be minified
 * @returns CDN url to Skypack of package
 */
function getSkypackCdnUrl(source: string, version: string, isDev?: boolean): string {
	if (version) {
		version = `@${version}`;
	}

	return `https://cdn.skypack.dev/${source}${version}${
		isDev ? '' : '?min'
	}`;
}

/**
 * Get version of package from package.json
 *
 * @param source The path to project root
 * @returns The version of package
 */
function getVersionForPackage(source: string): string {
	let version = '';

	try {
		// Get the exact version of the package, if possible, by reading its package.json file.
		const sourcePkgJson = staticRequire(`${source}/package.json`) as SamplePackage;

		version = sourcePkgJson.version;
	} catch (e) {}

	if (!version) {
		try {
			// Get the version range from the top level package json for this package.
			version = (staticRequire(cwdPkgJson) as SamplePackage).dependencies?.[source];

			if (version && /^[a-z]+:/.test(version) && !version.startsWith('npm:')) {
				// If the package is a 'file:', 'link:', 'workspace:', etc. dependency, ignore
				version = '';
			}
		} catch (e) {}
	}

	return version || '';
}

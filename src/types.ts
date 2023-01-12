export type BuildCdnUrlFunction = (source: string, version: string, isDev?: boolean) => string;

export type ImportOptions = Record<string, string | boolean>;

export type PluginOptions = {
	extensions?: string[];
	dev?: boolean;
	imports?: ImportOptions;
	getCdnUrl?: BuildCdnUrlFunction;
};

export type Cache = Record<string, string>;

export type SnowpackTransformOptions = {
	contents: string;
	isDev: boolean;
	fileExt: string;
};

export type SamplePackage = {
	version: string;
	dependencies: Record<string, string>;
};

// Tests
export type TestExpectedOptions = {
	min?: boolean;
	isNumber?: string;
};

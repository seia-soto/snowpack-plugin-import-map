export type TBuildCDNUrlFn = (source: string, version: string, isDev?: boolean) => string

export interface IImportOptions {
  [keys: string]: string | boolean
}

export interface IPluginOptions {
  extensions?: string[]
  dev?: boolean
  imports?: IImportOptions
  getCdnURL?: TBuildCDNUrlFn
}

export interface ICache {
  [keys: string]: string
}

export interface ISnowpackTransformOptions {
  contents: string
  isDev: boolean
  fileExt: string
}

// Tests
export interface ITestExpectedOptions {
  min?: boolean
  isNumber?: string
}

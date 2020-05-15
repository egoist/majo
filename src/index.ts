import path from 'path'
import fs from 'fs'
import { promisify } from 'util'
import glob from 'fast-glob'
import rimraf from 'rimraf'
import ensureDir from 'mkdirp'
import Wares from './wares'

export type Middleware = (ctx: Majo) => Promise<void> | void

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const remove = promisify(rimraf)

export interface File {
  /** The absolute path of the file */
  path: string
  stats: fs.Stats
  contents: Buffer
}

export type FilterHandler = (relativePath: string, file: File) => boolean

export type TransformHandler = (contents: string) => Promise<string> | string

export type OnWrite = (relativePath: string, outputPath: string) => void

export interface SourceOptions {
  /**
   * The base directory to search files from
   * @default `process.cwd()`
   */
  baseDir?: string
  /**
   * Whether to include dot files
   * @default `true`
   */
  dotFiles?: boolean
  /** This function is called when a file is written */
  onWrite?: OnWrite
}

export interface DestOptions {
  /**
   * The base directory to write files to
   * @default `process.cwd()`
   */
  baseDir?: string
  /**
   * Whether to clean output directory before writing files
   * @default `false`
   */
  clean?: boolean
}

export class Majo {
  middlewares: Middleware[]
  /**
   * An object you can use across middleware to share states
   */
  meta: {
    [k: string]: any
  }
  /**
   * Base directory
   * You normally set this by calling `.source`
   */
  baseDir?: string
  sourcePatterns?: string[]
  dotFiles?: boolean
  files: {
    [filename: string]: File
  }
  onWrite?: OnWrite

  constructor() {
    this.middlewares = []
    this.meta = {}
    this.files = {}
  }

  /**
   * Find files from specific directory
   * @param source Glob patterns
   * @param opts
   * @param opts.baseDir The base directory to find files
   * @param opts.dotFiles Including dot files
   */
  source(patterns: string | string[], options: SourceOptions = {}) {
    const { baseDir = '.', dotFiles = true, onWrite } = options
    this.baseDir = path.resolve(baseDir)
    this.sourcePatterns = Array.isArray(patterns) ? patterns : [patterns]
    this.dotFiles = dotFiles
    this.onWrite = onWrite
    return this
  }

  /**
   * Use a middleware
   */
  use(middleware: Middleware) {
    this.middlewares.push(middleware)
    return this
  }

  /**
   * Process middlewares against files
   */
  async process() {
    if (!this.sourcePatterns || !this.baseDir) {
      throw new Error(`[majo] You need to call .source first`)
    }

    const allEntries = await glob(this.sourcePatterns, {
      cwd: this.baseDir,
      dot: this.dotFiles,
      stats: true
    })

    await Promise.all(
      allEntries.map(entry => {
        const absolutePath = path.resolve(this.baseDir as string, entry.path)
        return readFile(absolutePath).then(contents => {
          const file = {
            contents,
            stats: entry.stats as fs.Stats,
            path: absolutePath
          }
          // Use relative path as key
          this.files[entry.path] = file
        })
      })
    )

    await new Wares().use(this.middlewares).run(this)

    return this
  }

  /**
   * Filter files
   * @param fn Filter handler
   */
  filter(fn: FilterHandler) {
    return this.use(context => {
      for (const relativePath in context.files) {
        if (!fn(relativePath, context.files[relativePath])) {
          delete context.files[relativePath]
        }
      }
    })
  }

  /**
   * Transform file at given path
   * @param relativePath Relative path
   * @param fn Transform handler
   */
  async transform(relativePath: string, fn: TransformHandler) {
    const contents = this.files[relativePath].contents.toString()
    const newContents = await fn(contents)
    this.files[relativePath].contents = Buffer.from(newContents)
  }

  /**
   * Run middlewares and write processed files to disk
   * @param dest Target directory
   * @param opts
   * @param opts.baseDir Base directory to resolve target directory
   * @param opts.clean Clean directory before writing
   */
  async dest(dest: string, options: DestOptions = {}) {
    const { baseDir = '.', clean = false } = options
    const destPath = path.resolve(baseDir, dest)
    await this.process()

    if (clean) {
      await remove(destPath)
    }

    await Promise.all(
      Object.keys(this.files).map(filename => {
        const { contents } = this.files[filename]
        const target = path.join(destPath, filename)
        if (this.onWrite) {
          this.onWrite(filename, target)
        }
        return ensureDir(path.dirname(target)).then(() =>
          writeFile(target, contents)
        )
      })
    )

    return this
  }

  /**
   * Get file contents as a UTF-8 string
   * @param relativePath Relative path
   */
  fileContents(relativePath: string): string {
    return this.file(relativePath).contents.toString()
  }

  /**
   * Write contents to specific file
   * @param relativePath Relative path
   * @param string File content as a UTF-8 string
   */
  writeContents(relativePath: string, contents: string) {
    this.files[relativePath].contents = Buffer.from(contents)
    return this
  }

  /**
   * Get the fs.Stats object of specified file
   * @para relativePath Relative path
   */
  fileStats(relativePath: string): fs.Stats {
    return this.file(relativePath).stats
  }

  /**
   * Get a file by relativePath path
   * @param relativePath Relative path
   */
  file(relativePath: string): File {
    return this.files[relativePath]
  }

  /**
   * Delete a file
   * @param relativePath Relative path
   */
  deleteFile(relativePath: string) {
    delete this.files[relativePath]
    return this
  }

  /**
   * Create a new file
   * @param relativePath Relative path
   * @param file
   */
  createFile(relativePath: string, file: File) {
    this.files[relativePath] = file
    return this
  }

  /**
   * Get an array of sorted file paths
   */
  get fileList(): string[] {
    return Object.keys(this.files).sort()
  }

  rename(fromPath: string, toPath: string) {
    if (!this.baseDir) {
      return this
    }
    const file = this.files[fromPath]
    this.createFile(toPath, {
      path: path.resolve(this.baseDir, toPath),
      stats: file.stats,
      contents: file.contents
    })
    this.deleteFile(fromPath)
    return this
  }
}

const majo = () => new Majo()

export { majo, remove, glob, ensureDir }

/**
 * Ensure directory exists before writing file
 */
export const outputFile = (
  filepath: string,
  data: any,
  options?: fs.WriteFileOptions
) =>
  ensureDir(path.dirname(filepath)).then(() =>
    writeFile(filepath, data, options)
  )

import path from 'path'
import fs from 'fs'
import { promisify } from 'util'
import glob from 'fast-glob'
import rimraf from 'rimraf'
import ensureDir from 'mkdirp'
import Wares from './wares'

export type Middleware = (ctx: MajoContext) => Promise<unknown> | unknown

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

export class MajoContext {
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

  constructor(files: { [filename: string]: File } = {}, baseDir?: string) {
    this.meta = {}
    this.files = files
    this.baseDir = baseDir
  }

  /**
   * Filter files
   * @param fn Filter handler
   */
  filter(fn: FilterHandler) {
    for (const relativePath in this.files) {
      if (!fn(relativePath, this.files[relativePath])) {
        delete this.files[relativePath]
      }
    }
    return this
  }

  /**
   * Transform file at given path
   * @param relativePath Relative path
   * @param fn Transform handler
   */
  transform(relativePath: string, fn: TransformHandler): this | Promise<this> {
    const contents = this.files[relativePath].contents.toString()
    const newContents = fn(contents)

    if (typeof newContents === 'string') {
      this.files[relativePath].contents = Buffer.from(newContents)
      return this
    }

    return newContents.then(contents => {
      this.files[relativePath].contents = Buffer.from(contents)
      return this
    })
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

export class Majo extends MajoContext {
  middlewares: Middleware[]
  private processed: boolean

  constructor() {
    super()
    this.middlewares = []
    this.processed = false
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
    this.files = {}
    this.processed = false
    return this
  }

  /**
   * Use a middleware
   */
  use(middleware: Middleware) {
    this.middlewares.push(middleware)
    return this
  }

  private mutate(fn: (context: MajoContext) => unknown) {
    if (this.processed) {
      fn(this)
      return this
    }
    return this.use(fn)
  }

  /**
   * Filter files
   * @param fn Filter handler
   */
  filter(fn: FilterHandler) {
    return this.mutate(context => context.filter(fn))
  }

  /**
   * Transform file at given path
   * @param relativePath Relative path
   * @param fn Transform handler
   */
  transform(relativePath: string, fn: TransformHandler) {
    if (this.processed) {
      return super.transform(relativePath, fn)
    }
    return this.use(context => context.transform(relativePath, fn))
  }

  /**
   * Write contents to specific file
   * @param relativePath Relative path
   * @param string File content as a UTF-8 string
   */
  writeContents(relativePath: string, contents: string) {
    if (this.processed) {
      return super.writeContents(relativePath, contents)
    }
    return this.use(context => context.writeContents(relativePath, contents))
  }

  /**
   * Delete a file
   * @param relativePath Relative path
   */
  deleteFile(relativePath: string) {
    if (this.processed) {
      return super.deleteFile(relativePath)
    }
    return this.use(context => context.deleteFile(relativePath))
  }

  /**
   * Create a new file
   * @param relativePath Relative path
   * @param file
   */
  createFile(relativePath: string, file: File) {
    if (this.processed) {
      return super.createFile(relativePath, file)
    }
    return this.use(context => context.createFile(relativePath, file))
  }

  rename(fromPath: string, toPath: string) {
    if (this.processed) {
      return super.rename(fromPath, toPath)
    }
    return this.use(context => context.rename(fromPath, toPath))
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

    const files: {
      [filename: string]: File
    } = {}

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
          files[entry.path] = file
        })
      })
    )

    const context = new MajoContext(files, this.baseDir)
    context.meta = this.meta

    await new Wares().use(this.middlewares).run(context)

    this.meta = context.meta
    this.files = context.files
    this.processed = true

    return this
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
    if (!this.processed) {
      await this.process()
    }

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

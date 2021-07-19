import path from 'path'
import fs from 'fs'
import { promisify } from 'util'
import glob from 'fast-glob'
import rimraf from 'rimraf'
import ensureDir from 'mkdirp'
import Wares from './wares'

export type Middleware = (ctx: MajoContext) => Promise<void> | void

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
  private files: Map<string, File>
  private majo: Majo

  constructor(majo: Majo, files: Map<string, File>) {
    this.files = files
    this.majo = majo
  }

  /**
   * Get a file by relativePath path
   * @param relativePath Relative path
   */
  file(relativePath: string): File {
    const file = this.files.get(relativePath)
    if (file === undefined) {
      throw new Error(
        `File with relative path \`${relativePath}\` doesn't exist`
      )
    }
    return file
  }

  /**
   * Transform file at given path
   * @param relativePath Relative path
   * @param fn Transform handler
   */
  async transform(relativePath: string, fn: TransformHandler) {
    const file = this.file(relativePath)
    const contents = file.contents.toString()
    const newContents = await fn(contents)
    file.contents = Buffer.from(newContents)
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
    this.file(relativePath).contents = Buffer.from(contents)
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
   * Delete a file
   * @param relativePath Relative path
   */
  deleteFile(relativePath: string) {
    this.files.delete(relativePath)
    return this
  }

  /**
   * Create a new file
   * @param relativePath Relative path
   * @param file
   */
  createFile(relativePath: string, file: File) {
    this.files.set(relativePath, file)
    return this
  }

  /**
   * Get an array of sorted file paths
   */
  get fileList(): string[] {
    return [...this.files.keys()].sort()
  }

  rename(fromPath: string, toPath: string) {
    if (!this.majo.baseDir) {
      return this
    }
    const file = this.file(fromPath)
    this.createFile(toPath, {
      path: path.resolve(this.majo.baseDir, toPath),
      stats: file.stats,
      contents: file.contents
    })
    this.deleteFile(fromPath)
    return this
  }
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
  onWrite?: OnWrite
  private context?: MajoContext

  constructor() {
    this.middlewares = []
    this.meta = {}
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
    if (this.context !== undefined) {
      return this
    }

    const allEntries = await glob(this.sourcePatterns, {
      cwd: this.baseDir,
      dot: this.dotFiles,
      stats: true
    })

    const files = new Map()
    await Promise.all(
      allEntries.map(entry => {
        const absolutePath = path.resolve(this.baseDir as string, entry.path)
        return readFile(absolutePath).then(contents => {
          const file = {
            contents,
            stats: entry.stats as fs.Stats,
            path: absolutePath
          }
          files.set(entry.path, file)
        })
      })
    )

    this.context = new MajoContext(this, files)

    await new Wares().use(this.middlewares).run(this.context)

    return this
  }

  /**
   * Filter files
   * @param fn Filter handler
   */
  filter(fn: FilterHandler) {
    return this.use(context => {
      for (const relativePath of context.fileList) {
        if (!fn(relativePath, context.file(relativePath))) {
          context.deleteFile(relativePath)
        }
      }
    })
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

    if (this.context === undefined) {
      throw new Error('unexpected')
    }
    const context = this.context
    await Promise.all(
      context.fileList.map(filename => {
        const { contents } = context.file(filename)
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
   * Get a file by relativePath path
   * @param relativePath Relative path
   */
  file(relativePath: string): File {
    if (this.context === undefined) {
      throw new Error('[majo]  You need to call .process/.dest first')
    }
    return this.context.file(relativePath)
  }

  /**
   * Get an array of sorted file paths
   */
  get fileList(): string[] {
    if (this.context === undefined) {
      throw new Error('[majo]  You need to call .process/.dest first')
    }
    return this.context.fileList
  }

  /**
   * Get the fs.Stats object of specified file
   * @para relativePath Relative path
   */
  fileStats(relativePath: string): fs.Stats {
    return this.file(relativePath).stats
  }

  /**
   * Get file contents as a UTF-8 string
   * @param relativePath Relative path
   */
  fileContents(relativePath: string): string {
    return this.file(relativePath).contents.toString()
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

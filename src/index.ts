import { Stats } from 'fs'
import { readFile, remove, writeFile, ensureDir } from 'fs-extra'
import globby from 'globby'
import path from 'path'
import Wares from './wares'

export type Middleware = (stream: Majo) => any

export interface IFiles {
  /** Relative path to the file */
  [relative: string]: IFile
}

export interface IFile {
  /** File contents */
  contents: Buffer
  /** File stats */
  stats: Stats
  /** Absolute path to the file */
  path: string
}

export type FilterFn = (relative: string, file: IFile) => boolean

export type TransformFn = (contents: string) => string | Promise<string>

export class Majo {
  public middlewares: Middleware[]
  /**
   * An object which is shared across middlewares, you can use this to pass down data from a middleware to another.
   */
  public meta: {
    [key: string]: any
  }
  /** The base dir to look for files */
  public baseDir: string
  /** Glob patterns */
  public sourcePatterns: string | string[]
  /** Allow dot files */
  public dotFiles: boolean
  /** The files found in `baseDir` */
  public files: IFiles

  constructor() {
    this.middlewares = []
    this.meta = {}
  }

  /**
   * Define how to find files
   * @param source Glob patterns
   * @param options
   * @param options.baseDir The base dir to look for files
   * @param options.dotFiles Include dot files
   */
  public source(
    source: string | string[],
    {
      baseDir = '.',
      dotFiles = true
    } = {}
  ) {
    this.baseDir = path.resolve(baseDir)
    this.sourcePatterns = source
    this.dotFiles = dotFiles

    return this
  }

  /**
   * Add middleware
   * @param middleware Middleware
   */
  public use(middleware: Middleware) {
    this.middlewares.push(middleware)

    return this
  }

  /**
   * Process all middlewares
   */
  public async process() {
    const statCache: {
      [relative: string]: Stats
    } = {}
    const paths = await globby(this.sourcePatterns, {
      cwd: this.baseDir,
      dot: this.dotFiles,
      nodir: true,
      statCache
    })

    this.files = {}

    await Promise.all(
      paths.map(async relative => {
        const absolutePath = path.resolve(this.baseDir, relative)

        return readFile(absolutePath).then(contents => {
          const stats =
            statCache[path.isAbsolute(this.baseDir) ? absolutePath : relative]
          const file = { contents, stats, path: absolutePath }
          this.files[relative] = file
        })
      })
    )

    await new Wares().use(this.middlewares).run(this)

    return this.files
  }

  /**
   * Add a filter to include/exclude files
   */
  public filter(fn: FilterFn) {
    return this.use(context => {
      Object.keys(context.files).forEach(relative => {
        if (!fn(relative, context.files[relative])) {
          // tslint:disable-next-line
          delete context.files[relative]
        }
      })
    })
  }

  /**
   * Transform files
   * @param relative Relative path of a file
   * @param fn The function to transform file
   */
  public async transform(relative: string, fn: TransformFn) {
    const contents = this.files[relative].contents.toString()
    const result = await fn(contents)
    this.files[relative].contents = Buffer.from(result)

    return this
  }

  /**
   * Write files
   * @param dest The output directory
   * @param options
   * @param options.baseDir The base directory to resolve `dest`
   * @param options.clean Whether to clean output directory before writing
   */
  public async dest(dest: string, { baseDir = '.', clean = false } = {}) {
    const destPath = path.resolve(baseDir, dest)
    const files = await this.process()

    if (clean) {
      await remove(destPath)
    }

    await Promise.all(
      Object.keys(files).map(async filename => {
        const { contents } = files[filename]
        const target = path.join(destPath, filename)

        return ensureDir(path.dirname(target)).then(async () =>
          writeFile(target, contents)
        )
      })
    )
  }

  /**
   * Get contents of specific file
   * @param relative The relative path of a file
   */
  public fileContents(relative: string) {
    return this.file(relative).contents.toString()
  }

  /**
   * Write contents to a file
   * @param relative The relative path of a file
   * @param str File contents as a string
   */
  public writeContents(relative: string, str: string) {
    this.files[relative].contents = Buffer.from(str)

    return this
  }

  /**
   * Get the stats of a file
   * @param relative The relative path of a file
   */
  public fileStats(relative: string) {
    return this.file(relative).stats
  }

  /**
   * Get a file
   * @param relative The relative path of a file
   */
  public file(relative: string) {
    return this.files[relative]
  }

  /**
   * Delete a file
   * @param relative The relative path of a file
   */
  public deleteFile(relative: string) {
    // tslint:disable-next-line
    delete this.files[relative]

    return this
  }

  /**
   * Create a file
   * @param relative The relative path of a file
   * @param file File
   */
  public createFile(relative: string, file: IFile) {
    this.files[relative] = file

    return this
  }

  /**
   * Get the list of file names
   */
  get fileList() {
    return Object.keys(this.files).sort()
  }
}

const majo = () => new Majo()

export default majo

// For CommonJS default export support
module.exports = majo

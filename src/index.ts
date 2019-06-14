import path from 'path'
import { EventEmitter } from 'events'
import fs from 'fs-extra'
import glob from 'fast-glob'
import Wares from './wares'

export type Middleware = (ctx: Majo) => Promise<void> | void
type Glob = string | string[]
type TransformFn = (contents: string) => Promise<string> | string
//@typedef {(ctx: Majo) => Promise<void> | void} Middleware
//source() opts have defaults and are not required
export interface Majo {
  meta: {[k: string]: any}
  baseDir: string
  sourcePatterns: Glob
  dotFiles: boolean
  middlewares: Middleware[]
  files: {[relativePath: string]: File}
}
type File = {path: string, stats: fs.Stats, contents: Buffer}

/**
 * @noInheritDoc 
 */
export class Majo extends EventEmitter {
  constructor() {
    super()
    this.middlewares = []
    /**
     * An object you can use across middleware to share states
     */
    this.meta = {}
    this.baseDir = '.'
  }

  /**
   * Find files from specific directory
   * @param source Glob patterns
   * @param opts
   * @param opts.baseDir The base directory to find files
   * @param opts.dotFiles Including dot files
   */
  source(patterns: Glob, { baseDir = '.', dotFiles = true } = {}) {
    this.baseDir = path.resolve(baseDir)
    this.sourcePatterns = patterns
    this.dotFiles = dotFiles
    return this
  }

  /**
   * Use a middleware
   * @param middleware
   */
  use(middleware: Middleware) {
    this.middlewares.push(middleware)
    return this
  }

  /**
   * Process middlewares against files
   */
  async process() {
    const allStats = await glob(this.sourcePatterns, {
      cwd: this.baseDir,
      dot: this.dotFiles,
      stats: true
    })

    this.files = {}

    await Promise.all(
      allStats.map((stats: any) => {
        const absolutePath = path.resolve(this.baseDir, stats.path)
        return fs.readFile(absolutePath).then(contents => {
          const file = { contents, stats, path: absolutePath }
          this.files[stats.path] = file
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
  filter(fn: (relativePath: string, file: File) => boolean) {
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
  transform(relativePath: string, fn: (contents: string) => string | Promise<string>) {
    const contents = this.files[relativePath].contents.toString()
    const result = fn(contents)
    if (typeof result == "string") {
      this.files[relativePath].contents = Buffer.from(result)
      return
    }
    return result.then(newContents => {
      this.files[relativePath].contents = Buffer.from(newContents)
    })
  }

  /**
   * Run middlewares and write processed files to disk
   * @param dest Target directory
   * @param opts
   * @param opts.baseDir Base directory to resolve target directory
   * @param opts.clean Clean directory before writing
   */
  async dest(dest: string, { baseDir = '.', clean = false } = {}) {
    const destPath = path.resolve(baseDir, dest)
    await this.process()

    if (clean) {
      await fs.remove(destPath)
    }

    await Promise.all(
      Object.keys(this.files).map(filename => {
        const { contents } = this.files[filename]
        const target = path.join(destPath, filename)
        this.emit('write', filename, target)
        return fs
          .ensureDir(path.dirname(target))
          .then(() => fs.writeFile(target, contents))
      })
    )

    return this
  }

  /**
   * Get file contents as a UTF-8 string
   * @param  relativePath Relative path
   *  
   */
  fileContents(relativePath:string) {
    return this.file(relativePath).contents.toString()
  }

  /**
   * Write contents to specific file
   * @param  relativePath Relative path
   * @param  string File content as a UTF-8 string
   */
  writeContents(relativePath: string, string:string) {
    this.files[relativePath].contents = Buffer.from(string)
    return this
  }

  /**
   * Get the fs.Stats object of specified file
   * @param relativePath Relative path
   *  
   */
  fileStats(relativePath: string) {
    return this.file(relativePath).stats
  }

  /**
   * Get a file by relativePath path
   * @param  relativePath Relative path
   *  
   */
  file(relativePath:string) {
    return this.files[relativePath]
  }

  /**
   * Delete a file
   * @param  relativePath Relative path
   */
  deleteFile(relativePath:string) {
    delete this.files[relativePath]
    return this
  }

  /**
   * Create a new file
   * @param  relativePath Relative path
   * @param  file
   */
  createFile(relativePath:string, file: File) {
    this.files[relativePath] = file
    return this
  }

  /**
   * Get an array of sorted file paths
   *  
   */
  get fileList() {
    return Object.keys(this.files).sort()
  }

  rename(fromPath: string, toPath:string ) {
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

majo.glob = glob
majo.fs = fs

export default majo

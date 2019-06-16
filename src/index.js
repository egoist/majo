import path from 'path'
import { EventEmitter } from 'events'
import fs from 'fs-extra'
import glob from 'fast-glob'
import Wares from './wares'

class MajoFiles {
  constructor(majo, files, meta) {
    /**
     * @type {Majo}
     */
    this.majo = majo
    /**
     * @typedef {{path: string, stats: fs.Stats, contents: Buffer}} File
     * @type {{[relativePath: string]: File}}
     */
    this.files = files
    /**
     * An object you can use across middleware to share states
     * @type {{[k: string]: any}}
     */
    this.meta = meta
  }

  /**
   * Transform file at given path
   * @param {string} relativePath Relative path
   * @param {(contents: string) => string} fn Transform handler
   */
  transform(relativePath, fn) {
    const contents = this.files[relativePath].contents.toString()
    const result = fn(contents)
    if (!result.then) {
      this.files[relativePath].contents = Buffer.from(result)
      return
    }
    return result.then(newContents => {
      this.files[relativePath].contents = Buffer.from(newContents)
    })
  }

  /**
   * Get file contents as a UTF-8 string
   * @param {string} relativePath Relative path
   * @return {string}
   */
  fileContents(relativePath) {
    return this.file(relativePath).contents.toString()
  }

  /**
   * Write contents to specific file
   * @param {string} relativePath Relative path
   * @param {string} string File content as a UTF-8 string
   */
  writeContents(relativePath, string) {
    this.files[relativePath].contents = Buffer.from(string)
    return this
  }

  /**
   * Get the fs.Stats object of specified file
   * @param {string} relativePath Relative path
   * @return {fs.Stats}
   */
  fileStats(relativePath) {
    return this.file(relativePath).stats
  }

  /**
   * Get a file by relativePath path
   * @param {string} relativePath Relative path
   * @return {File}
   */
  file(relativePath) {
    return this.files[relativePath]
  }

  /**
   * Delete a file
   * @param {string} relativePath Relative path
   */
  deleteFile(relativePath) {
    delete this.files[relativePath]
    return this
  }

  /**
   * Create a new file
   * @param {string} relativePath Relative path
   * @param {File} file
   */
  createFile(relativePath, file) {
    this.files[relativePath] = file
    return this
  }

  /**
   * Get an array of sorted file paths
   * @return {string[]}
   */
  get fileList() {
    return Object.keys(this.files).sort()
  }

  /**
   * Rename file
   * @param {string} fromPath
   * @param {string} toPath
   */
  rename(fromPath, toPath) {
    this.createFile(toPath, this.files[fromPath])
    this.deleteFile(fromPath)
    return this
  }

  /**
   * Write all current resuting files
   * @param {string} destPath
   */
  async writeToPath(destPath) {
    await Promise.all(
      Object.keys(this.files).map(filename => {
        const { contents } = this.files[filename]
        const target = path.join(destPath, filename)
        this.majo.emit('write', filename, target)
        return fs
          .ensureDir(path.dirname(target))
          .then(() => fs.writeFile(target, contents))
      })
    )
  }
}

class Majo extends EventEmitter {
  constructor() {
    super()
    /**
     * @typedef {(ctx: Majo) => Promise<void> | void} Middleware
     * @type {Middleware[]} */
    this.middlewares = []
    /**
     * An object you can use across middleware to share states
     * @type {{[k: string]: any}}
     */
    this.meta = {}
  }

  /**
   * Find files from specific directory
   * @param {string | string[]} source Glob patterns
   * @param {{baseDir?: string, dotFiles?: boolean}} opts
   * @param opts.baseDir The base directory to find files
   * @param opts.dotFiles Including dot files
   */
  source(patterns, { baseDir = '.', dotFiles = true } = {}) {
    this.baseDir = path.resolve(baseDir)
    this.sourcePatterns = patterns
    this.dotFiles = dotFiles
    return this
  }

  /**
   * Use a middleware
   * @param {(ctx: Majo) => Promise<void> | void} middleware
   */
  use(middleware) {
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

    const files = {}

    await Promise.all(
      allStats.map(stats => {
        const absolutePath = path.resolve(this.baseDir, stats.path)
        return fs.readFile(absolutePath).then(contents => {
          files[stats.path] = { contents, stats, path: absolutePath }
        })
      })
    )

    /**
     * @type {MajoFiles}
     */
    this.majoFiles = new MajoFiles(this, files, this.meta)

    await new Wares().use(this.middlewares).run(this.majoFiles)

    /**
     * @typedef {{path: string, stats: fs.Stats, contents: Buffer}} File
     * @type {{[relativePath: string]: File}}
     */
    this.files = this.majoFiles.files

    return this
  }

  /**
   * Filter files
   * @param {(relativePath: string, file: File) => boolean} fn Filter handler
   */
  filter(fn) {
    return this.use(context => {
      for (const relativePath in context.files) {
        if (!fn(relativePath, context.files[relativePath])) {
          delete context.files[relativePath]
        }
      }
    })
  }

  /**
   * Run middlewares and write processed files to disk
   * @param {string} dest Target directory
   * @param {{baseDir?: string, clean?: boolean}} opts
   * @param opts.baseDir Base directory to resolve target directory
   * @param opts.clean Clean directory before writing
   */
  async dest(dest, { baseDir = '.', clean = false } = {}) {
    const destPath = path.resolve(baseDir, dest)
    await this.process()

    if (clean) {
      await fs.remove(destPath)
    }

    await this.majoFiles.writeToPath(destPath)

    return this
  }

  /**
   * Get an array of sorted file paths
   * @return {string[]}
   */
  get fileList() {
    return this.majoFiles.fileList
  }
}

const majo = () => new Majo()

majo.glob = glob
majo.fs = fs

export default majo

import path from 'path'
import fs from 'fs'
import { File, FilterHandler, TransformHandler } from './'

/** The loaded files and shared state passed to each middleware. */
export class MajoContext {
  constructor(
    public baseDir: string,
    public files: { [filename: string]: File },
    public meta: { [key: string]: any }
  ) {}

  /** Filter the loaded files immediately. */
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
  async transform(relativePath: string, fn: TransformHandler) {
    const contents = this.files[relativePath].contents.toString()
    const newContents = await fn(contents)
    this.files[relativePath].contents = Buffer.from(newContents)
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

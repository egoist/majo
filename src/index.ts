import fs from 'fs-extra'
import globby from 'globby'
import path from 'path'
import Wares from './wares'

export type Middleware = (stream: Majo) => any

export interface IFiles {
  [relative: string]: IFile
}

export interface IFile {
  contents: Buffer
  stats: fs.Stats
  path: string
}

export type FilterFn = (relative: string, file: IFile) => boolean

export type TransformFn = (contents: string) => string | Promise<string>

export class Majo {
  public middlewares: Middleware[]
  public meta: any
  public baseDir: string
  public sourcePatterns: string | string[]
  public dotFiles: boolean
  public files: IFiles

  constructor() {
    this.middlewares = []
    this.meta = {}
  }

  public source(source: string | string[], {baseDir = '.', dotFiles = true} = {}) {
    this.baseDir = path.resolve(baseDir)
    this.sourcePatterns = source
    this.dotFiles = dotFiles

    return this
  }

  public use(middleware: Middleware) {
    this.middlewares.push(middleware)

    return this
  }

  public async process() {
    const statCache: {
      [relative: string]: fs.Stats;
    } = {}
    const paths = await globby(this.sourcePatterns, {
      cwd: this.baseDir,
      dot: this.dotFiles,
      nodir: true,
      statCache,
    })

    this.files = {}

    await Promise.all(
      paths.map(async relative => {
        const absolutePath = path.resolve(this.baseDir, relative)

        return fs.readFile(absolutePath).then(contents => {
          const stats =
            statCache[path.isAbsolute(this.baseDir) ? absolutePath : relative]
          const file = {contents, stats, path: absolutePath}
          this.files[relative] = file
        })
      }),
    )

    await new Wares().use(this.middlewares).run(this)

    return this.files
  }

  public filter(fn: FilterFn) {
    return this.use(context => {
      Object.keys(context.files).forEach(relative => {
        if (!fn(relative, context.files[relative])) {
          // tslint:disable-next-line
          delete context.files[relative];
        }
      })
    })
  }

  public async transform(relative: string, fn: TransformFn) {
    const contents = this.files[relative].contents.toString()
    const result = await fn(contents)
    this.files[relative].contents = Buffer.from(result)

    return this
  }

  public async dest(dest: string, {baseDir = '.', clean = false} = {}) {
    const destPath = path.resolve(baseDir, dest)
    const files = await this.process()

    if (clean) {
      await fs.remove(destPath)
    }

    await Promise.all(
      Object.keys(files).map(async filename => {
        const {contents} = files[filename]
        const target = path.join(destPath, filename)

        return fs
          .ensureDir(path.dirname(target))
          .then(async () => fs.writeFile(target, contents))
      }),
    )
  }

  public fileContents(relative: string) {
    return this.file(relative).contents.toString()
  }

  public writeContents(relative: string, str: string) {
    this.files[relative].contents = Buffer.from(str)

    return this
  }

  public fileStats(relative: string) {
    return this.file(relative).stats
  }

  public file(relative: string) {
    return this.files[relative]
  }

  public deleteFile(relative: string) {
    // tslint:disable-next-line
    delete this.files[relative];

    return this
  }

  public createFile(relative: string, file: IFile) {
    this.files[relative] = file

    return this
  }

  get fileList() {
    return Object.keys(this.files).sort()
  }
}

const majo = () => new Majo()

export default majo

// For CommonJS default export support
module.exports = majo

import path from 'path'
import fs from 'fs-extra'
import globby from 'globby'
// @ts-ignore
import ware from 'ware'

type Middleware = (ctx: Majo) => any
type Glob = string | string[]
type TransformFn = (contents: string) => Promise<string> | string

interface Files {
  [relativePath: string]: File
}

interface File {
  path?: string,
  contents: Buffer,
  stats: fs.Stats,
  [key: string]: any
}

interface StatCache {
  [path: string]: fs.Stats
}

class Majo {
  middlewares: Middleware[]
  meta: any
  baseDir: string
  sourcePatterns: Glob
  dotFiles: boolean
  files: Files

  constructor() {
    this.middlewares = []
    this.meta = {}
  }

  source(source: Glob, {
    baseDir = '.',
    dotFiles = true
  } = {}) {
    this.baseDir = path.resolve(baseDir)
    this.sourcePatterns = source
    this.dotFiles = dotFiles
    return this
  }

  use(middleware: Middleware) {
    this.middlewares.push(middleware)
    return this
  }

  async process() {
    const statCache: StatCache = {}
    const paths = await globby(this.sourcePatterns, {
      nodir: true,
      cwd: this.baseDir,
      dot: this.dotFiles,
      statCache
    })

    this.files = {}

    await Promise.all(paths.map((relative: string) => {
      const absolutePath = path.resolve(this.baseDir, relative)
      return fs.readFile(absolutePath)
        .then((contents: Buffer) => {
          const stats = statCache[path.isAbsolute(this.baseDir) ? absolutePath : relative]
          const file = { contents, stats, path: absolutePath }
          this.files[relative] = file
        })
    }))

    await new Promise((resolve, reject) => {
      ware().use(this.middlewares).run(this, (err: Error) => {
        if (err) return reject(err)
        resolve()
      })
    })

    return this.files
  }

  filter(fn: (relativePath: string, file: File) => boolean) {
    return this.use((context: this) => {
      for (const relative in context.files) {
        if (!fn(relative, context.files[relative])) {
          delete context.files[relative]
        }
      }
    })
  }

  transform(relative: string, fn: TransformFn) {
    const contents = this.files[relative].contents.toString()
    const result = fn(contents)
    if (typeof result === 'string') {
      this.files[relative].contents = Buffer.from(result)
      return
    }
    return result.then((newContents: string) => {
      this.files[relative].contents = Buffer.from(newContents)
    })
  }

  async dest(dest: string, {
    baseDir = '.',
    clean = false
  } = {}) {
    const destPath = path.resolve(baseDir, dest)
    const files = await this.process()

    if (clean) {
      await fs.remove(destPath)
    }

    await Promise.all(Object.keys(files).map((filename: string) => {
      const { contents } = files[filename]
      const target = path.join(destPath, filename)
      return fs.ensureDir(path.dirname(target))
        .then(() => fs.writeFile(target, contents))
    }))
  }

  fileContents(relative: string) {
    return this.file(relative).contents.toString()
  }

  writeContents(relative: string, str: string) {
    this.files[relative].contents = Buffer.from(str)
    return this
  }

  fileStats(relative: string) {
    return this.file(relative).stats
  }

  file(relative: string) {
    return this.files[relative]
  }

  deleteFile(relative: string) {
    delete this.files[relative]
    return this
  }

  createFile(relative: string, file: File) {
    this.files[relative] = file
    return this
  }

  get fileList() {
    return Object.keys(this.files).sort()
  }
}

export default function () {
  return new Majo()
}

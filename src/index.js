import path from 'path'
import fs from 'fs-promise'
import series from 'promise.series'
import globby from 'globby'

class Majo {
  constructor() {
    this.middlewares = []
    this.meta = {}
  }

  source(source, {
    cwd = '.',
    dotFiles = true
  } = {}) {
    this.cwd = cwd
    this.sourcePatterns = source
    this.dotFiles = dotFiles
    return this
  }

  use(middleware) {
    this.middlewares.push(middleware)
    return this
  }

  async process() {
    const statCache = {}
    const paths = await globby(this.sourcePatterns, {
      nodir: true,
      cwd: this.cwd,
      dot: this.dotFiles,
      statCache
    })

    this.files = {}

    await Promise.all(paths.map(relative => {
      const absolutePath = path.resolve(this.cwd, relative)
      return fs.readFile(absolutePath)
        .then(contents => {
          const stats = statCache[path.isAbsolute(this.cwd) ? absolutePath : relative]
          const file = { contents, stats, path: absolutePath }
          this.files[relative] = file
        })
    }))

    await series(this.middlewares.map(m => () => m.call(this, this)))

    return this.files
  }

  filter(fn) {
    return this.use(context => {
      for (const relative in context.files) {
        if (!fn(relative, context.files[relative])) {
          delete context.files[relative]
        }
      }
    })
  }

  transform(relative, fn) {
    const contents = this.files[relative].contents.toString()
    const result = fn(contents)
    if (!result.then) {
      this.files[relative].contents = Buffer.from(result)
      return
    }
    return result.then(newContents => {
      this.files[relative].contents = Buffer.from(newContents)
    })
  }

  async dest(dest, {
    cwd = '.',
    clean
  } = {}) {
    const destPath = path.resolve(cwd, dest)
    const files = await this.process()

    if (clean) {
      await fs.rmdir(destPath)
    }

    await Promise.all(Object.keys(files).map(filename => {
      const { contents } = files[filename]
      const target = path.join(destPath, filename)
      return fs.ensureDir(path.dirname(target))
        .then(() => fs.writeFile(target, contents))
    }))
  }

  fileContents(relative) {
    return this.file(relative).contents.toString()
  }

  writeContents(relative, string) {
    this.files[relative].contents = Buffer.from(string)
    return this
  }

  fileStats(relative) {
    return this.file(relative).stats
  }

  file(relative) {
    return this.files[relative]
  }

  deleteFile(relative) {
    delete this.files[relative]
    return this
  }

  createFile(relative, file) {
    this.files[relative] = file
    return this
  }

  get fileList() {
    return Object.keys(this.files).sort()
  }
}

export default opts => new Majo(opts)

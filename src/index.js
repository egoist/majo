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
    cwd = '.'
  } = {}) {
    this.cwd = cwd
    this.sourcePatterns = source
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
      statCache
    })

    this.files = {}

    await Promise.all(paths.map(relative => {
      const absolutePath = path.resolve(this.cwd, relative)
      return fs.readFile(absolutePath)
        .then(contents => {
          const stat = statCache[relative]
          const file = { contents, stat, path: absolutePath }
          this.files[relative] = file
        })
    }))

    await series(this.middlewares.map(m => () => m.call(this, this)))

    return this.files
  }

  filter(fn) {
    this.use(context => {
      for (const relative in context.files) {
        if (!fn(relative, context.files[relative])) {
          delete context.files[relative]
        }
      }
    })
    return this
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
    cwd = '.'
  } = {}) {
    const destPath = path.resolve(cwd, dest)
    const files = await this.process()

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

  fileStat(relative) {
    return this.file(relative).stat
  }

  file(relative) {
    return this.files[relative]
  }
}

export default opts => new Majo(opts)

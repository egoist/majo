import path from 'path'
import fs from 'fs-promise'
import series from 'promise.series'
import globby from 'globby'

class Majo {
  constructor() {
    this.middlewares = []
    this.filters = []
    this.meta = {}
  }

  source(source, {
    cwd = process.cwd()
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
    }).then(paths => paths.map(p => path.join(this.cwd, p)))

    this.files = {}

    await Promise.all(paths.map(absolutePath => {
      const relative = path.relative(this.cwd, absolutePath)
      return fs.readFile(absolutePath)
        .then(contents => {
          const stat = statCache[absolutePath]
          const file = { contents, stat, path: absolutePath }
          if (this.filters.every(filter => {
            return filter(relative, file)
          })) {
            this.files[relative] = file
          }
        })
    }))

    const callContext = {
      cwd: this.cwd,
      files: this.files,
      meta: this.meta,
      transform: this.transform
    }

    await series(this.middlewares.map(m => () => m.call(callContext, callContext)))

    return this.files
  }

  filter(fn) {
    this.filters.push(fn)
    return this
  }

  transform(relative, fn) {
    const contents = this.files[relative].contents.toString()
    const result = fn(contents)
    if (!result.then) {
      return this.files[relative].contents = Buffer.from(result)
    }
    return result.then(newContents => {
      this.files[relative].contents = Buffer.from(newContents)
    })
  }

  async dest(dest, {
    cwd = process.cwd()
  }) {
    const destPath = path.resolve(cwd, dest)
    const files = await this.process()

    await Promise.all(Object.keys(files).map(filename => {
      const { contents } = files[filename]
      const target = path.join(destPath, filename)
      return fs.ensureDir(path.dirname(target))
        .then(() => fs.writeFile(target, contents))
    }))
  }

  fileContent(relative) {
    return this.file(relative).contents.toString()
  }

  fileStat(relative) {
    return this.file(relative).stat
  }

  file(relative) {
    return this.files[relative]
  }
}

export default opts => new Majo(opts)

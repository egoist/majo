import path from 'path'
import fs from 'fs'
import { Majo, majo, glob, remove } from '../src'

test('main', async () => {
  const outputDir = path.join(__dirname, 'output/main')
  await remove(outputDir)
  const stream = await majo()
    .source('**', { baseDir: path.join(__dirname, 'fixture/source') })
    .dest('./output/main', { baseDir: __dirname })
  expect(
    await glob('**/*', { cwd: outputDir }).then(result => result.sort())
  ).toEqual(stream.fileList)
})

test('middleware', async () => {
  const stream = majo()
    .source('**', { baseDir: path.join(__dirname, 'fixture/source') })
    .use(({ files }) => {
      const contents = files['tmp.js'].contents.toString()
      files['tmp.js'].contents = Buffer.from(contents.replace(`'a'`, `'aaa'`))
    })

  await stream.process()

  expect(stream.fileContents('tmp.js')).toMatch(`const a = () => 'aaa'`)
})

test('middleware context is separate from majo instance', async () => {
  const stream = majo().source('**', {
    baseDir: path.join(__dirname, 'fixture/source')
  })

  stream.use(context => {
    expect(context).not.toBe(stream)
    expect(context).not.toBeInstanceOf(Majo)
    expect(context).not.toHaveProperty('source')
    expect(context.fileList).toContain('tmp.js')
  })

  await stream.process()
})

test('file operations can be called before processing', async () => {
  const baseDir = path.join(__dirname, 'fixture/source')
  const stream = majo().source('**', { baseDir })

  stream.transform('tmp.js', contents => contents.replace(`'a'`, `'bbb'`))
  stream.rename('tmp.js', 'renamed/tmp.js')
  stream.writeContents('should-filter.js', 'module.exports = true\n')
  stream.createFile('created.txt', {
    path: path.join(baseDir, 'created.txt'),
    stats: fs.statSync(path.join(baseDir, 'tmp.js')),
    contents: Buffer.from('created')
  })
  stream.deleteFile('should-filter.js')

  await stream.process()

  expect(stream.fileContents('renamed/tmp.js')).toMatch(`const a = () => 'bbb'`)
  expect(stream.fileContents('created.txt')).toBe('created')
  expect(stream.fileList).not.toContain('tmp.js')
  expect(stream.fileList).not.toContain('should-filter.js')
})

test('filter', async () => {
  const stream = majo()

  stream
    .source('**', { baseDir: path.join(__dirname, 'fixture/source') })
    .filter(filepath => {
      return filepath !== 'should-filter.js'
    })

  await stream.process()

  expect(stream.fileList).toContain('tmp.js')
  expect(stream.fileList).not.toContain('should-filter.js')
})

test('middleware context can filter files', async () => {
  const stream = majo()

  stream
    .source('**', { baseDir: path.join(__dirname, 'fixture/source') })
    .use(ctx => {
      ctx.filter(filepath => {
        return filepath !== 'should-filter.js'
      })
    })

  await stream.process()

  expect(stream.fileList).toContain('tmp.js')
  expect(stream.fileList).not.toContain('should-filter.js')
})

test('queued file operations see reassigned middleware meta', async () => {
  const stream = majo()

  stream
    .source('**', { baseDir: path.join(__dirname, 'fixture/source') })
    .use(ctx => {
      ctx.meta = { test: false }
    })
    .filter(filepath => {
      return filepath !== 'should-filter.js' || stream.meta.test
    })

  await stream.process()

  expect(stream.meta).toEqual({ test: false })
  expect(stream.fileList).toContain('tmp.js')
  expect(stream.fileList).not.toContain('should-filter.js')
})

test('stats', async () => {
  const stream = majo()

  stream.source('**/*.md', { baseDir: path.join(__dirname, 'fixture/stats') })

  await stream.process()

  expect(typeof stream.files['foo.md'].stats).toBe('object')
})

test('rename', async () => {
  const stream = majo()

  stream.source('**/*', { baseDir: path.join(__dirname, 'fixture/rename') })

  stream.use(ctx => {
    ctx.rename('a.txt', 'b/c.txt')
  })

  await stream.process()

  expect(stream.fileList).toEqual(['b/c.txt'])
})

test('rename can be called before writing to dest', async () => {
  const outputDir = path.join(__dirname, 'output/rename')
  await remove(outputDir)

  const stream = await majo()
    .source('**/*', { baseDir: path.join(__dirname, 'fixture/rename') })
    .rename('a.txt', 'b/c.txt')
    .dest('./output/rename', { baseDir: __dirname })

  expect(stream.fileList).toEqual(['b/c.txt'])
  expect(await glob('**/*', { cwd: outputDir })).toEqual(['b/c.txt'])
})

test('file operations can be called after processing', async () => {
  const outputDir = path.join(__dirname, 'output/post-process')
  await remove(outputDir)

  const stream = majo().source('**/*', {
    baseDir: path.join(__dirname, 'fixture/rename')
  })

  await stream.process()

  stream.createFile('b.txt', {
    ...stream.file('a.txt'),
    path: path.join(__dirname, 'fixture/rename/b.txt'),
    contents: Buffer.from('b')
  })
  stream.rename('a.txt', 'c.txt')

  expect(stream.fileList).toEqual(['b.txt', 'c.txt'])
  expect(stream.fileContents('b.txt')).toBe('b')

  await stream.dest('./output/post-process', { baseDir: __dirname })

  expect(
    await glob('**/*', { cwd: outputDir }).then(result => result.sort())
  ).toEqual(['b.txt', 'c.txt'])
})

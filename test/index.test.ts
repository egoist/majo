import path from 'path'
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

  stream.use(ctx => {
    expect(ctx).not.toBe(stream)
    expect(ctx).not.toBeInstanceOf(Majo)
    expect(ctx).not.toHaveProperty('source')
    expect(ctx.fileList).toContain('tmp.js')
  })

  await stream.process()
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

test('rename directly after processing', async () => {
  const stream = majo().source('**/*', {
    baseDir: path.join(__dirname, 'fixture/rename')
  })

  await stream.process()

  stream.rename('a.txt', 'b/c.txt')

  expect(stream.fileList).toEqual(['b/c.txt'])
})

test('createFile directly after processing', async () => {
  const stream = majo().source('**/*', {
    baseDir: path.join(__dirname, 'fixture/rename')
  })

  await stream.process()

  stream.createFile('b.txt', {
    ...stream.file('a.txt'),
    path: path.join(__dirname, 'fixture/rename/b.txt'),
    contents: Buffer.from('b')
  })

  expect(stream.fileList).toEqual(['a.txt', 'b.txt'])
  expect(stream.fileContents('b.txt')).toBe('b')
})

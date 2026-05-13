import path from 'path'
import { majo, glob, remove } from '../src'

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

test('multiple source calls', async () => {
  const sourceDir = path.join(__dirname, 'fixture/source')
  const statsDir = path.join(__dirname, 'fixture/stats')
  const stream = majo()

  stream
    .source('**/*.js', { baseDir: sourceDir })
    .source('**/*.md', { baseDir: statsDir })

  await stream.process()

  expect(stream.fileList).toEqual(['foo.md', 'should-filter.js', 'tmp.js'])
  expect(stream.file('tmp.js').path).toBe(path.join(sourceDir, 'tmp.js'))
  expect(stream.file('foo.md').path).toBe(path.join(statsDir, 'foo.md'))
})

test('rename after multiple source calls keeps original source base', async () => {
  const firstDir = path.join(__dirname, 'fixture/multiple-source/first')
  const secondDir = path.join(__dirname, 'fixture/multiple-source/second')
  const stream = majo()

  stream
    .source('*.txt', { baseDir: firstDir })
    .source('*.txt', { baseDir: secondDir })
    .use(ctx => {
      ctx.rename('first.txt', 'renamed/first.txt')
    })

  await stream.process()

  expect(stream.fileList).toEqual(['renamed/first.txt', 'second.txt'])
  expect(stream.file('renamed/first.txt').path).toBe(
    path.join(firstDir, 'renamed/first.txt')
  )
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

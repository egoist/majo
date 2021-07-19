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
    .use(ctx => {
      const file = ctx.file('tmp.js')
      const contents = file.contents.toString()
      file.contents = Buffer.from(contents.replace(`'a'`, `'aaa'`))
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

  expect(typeof stream.file('foo.md').stats).toBe('object')
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

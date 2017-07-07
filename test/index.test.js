import path from 'path'
import * as buble from 'buble'
import majo from '../src'

test('main', async () => {
  await majo()
    .source('**', { baseDir: path.join(__dirname, 'fixture/source') })
    .dest('./output', { baseDir: __dirname })
})

test('middleware', async () => {
  const stream = majo()
    .source('**', { baseDir: path.join(__dirname, 'fixture/source') })
    .use(({ files }) => {
      for (const filename in files) {
        if (/\.js$/.test(filename)) {
          files[filename].contents = Buffer.from(buble.transform(files[filename].contents.toString()).code)
        }
      }
    })
    .use(({ files }) => {
      const contents = files['tmp.js'].contents.toString()
      files['tmp.js'].contents = Buffer.from(contents.replace(`'a'`, `'aaa'`))
    })

  await stream.process()

  expect(stream.fileContents('tmp.js')).toMatch(`var a = function () { return 'aaa'; }`)
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

import fs from 'fs'
import path from 'path'
import { majo, Majo, MajoContext, Middleware, remove } from '../src'

const baseDir = path.join(__dirname, 'fixture/rename')
const source = () => majo().source('**/*', { baseDir })

// These assertions are also checked by ts-jest and tsc. A stream configures a
// pipeline; only its loaded middleware context can mutate files.
const streamHasRename: 'rename' extends keyof Majo ? true : false = false
const contextHasUse: 'use' extends keyof MajoContext ? true : false = false

test('middleware receives a separate, typed context after files load', async () => {
  const stream = source()
  const middleware: Middleware = context => {
    expect(context).toBeInstanceOf(MajoContext)
    expect(context).not.toBe(stream)
    expect(context.baseDir).toBe(baseDir)
    expect(context.fileList).toEqual(['a.txt'])
    expect(context.fileStats('a.txt').isFile()).toBe(true)
    expect('source' in context).toBe(false)
    expect('use' in context).toBe(contextHasUse)
    expect('dest' in context).toBe(false)
  }
  expect('rename' in stream).toBe(streamHasRename)
  expect('transform' in stream).toBe(false)
  expect('createFile' in stream).toBe(false)
  expect('deleteFile' in stream).toBe(false)
  expect('writeContents' in stream).toBe(false)
  expect(await stream.use(middleware).process()).toBe(stream)
})

test('async transforms and renames finish before subsequent middleware', async () => {
  const stream = source()
  const contexts: MajoContext[] = []
  stream.use(async context => {
    contexts.push(context)
    await context.transform('a.txt', async text => text.toUpperCase() + '!')
    context.rename('a.txt', 'nested/result.txt')
    context.meta.transformed = true
  })
  stream.use(context => {
    contexts.push(context)
    expect(context.fileContents('nested/result.txt')).toBe(
      fs.readFileSync(path.join(baseDir, 'a.txt'), 'utf8').toUpperCase() + '!'
    )
    expect(context.file('nested/result.txt').path).toBe(
      path.join(baseDir, 'nested/result.txt')
    )
    expect(context.meta.transformed).toBe(true)
    expect(context.file('a.txt')).toBeUndefined()
  })
  await stream.process()
  expect(contexts[0]).toBe(contexts[1])
  expect(stream.fileList).toEqual(['nested/result.txt'])
  expect(stream.meta.transformed).toBe(true)
})

test('context filters immediately and file mutators chain', async () => {
  const stream = source().filter(name => name.endsWith('.txt'))
  stream.use(context => {
    const original = context.file('a.txt')
    context
      .createFile('b.txt', { ...original, contents: Buffer.from('before') })
      .writeContents('b.txt', 'after')
      .createFile('c.txt', original)
      .deleteFile('c.txt')
      .filter(name => name !== 'a.txt')
    expect(context.fileList).toEqual(['b.txt'])
    expect(context.fileContents('b.txt')).toBe('after')
  })
  await stream.process()
  expect(stream.fileList).toEqual(['b.txt'])
})

test('file and metadata replacements are shared with later middleware and stream', async () => {
  const stream = source()
  stream.meta.initial = true
  stream.use(context => {
    expect(context.meta).toBe(stream.meta)
    context.files = { 'new.txt': context.file('a.txt') }
    context.meta = { replaced: true }
  })
  stream.use(context => {
    expect(context.fileList).toEqual(['new.txt'])
    expect(context.meta).toEqual({ replaced: true })
  })
  await stream.process()
  expect(stream.fileList).toEqual(['new.txt'])
  expect(stream.meta).toEqual({ replaced: true })
})

test('middleware failures propagate and preserve the resulting context', async () => {
  const stream = source()
  const later = jest.fn()
  stream
    .use(async context => {
      context.files = {}
      context.meta = { attempted: true }
      throw new Error('middleware failed')
    })
    .use(later)
  await expect(stream.process()).rejects.toThrow('middleware failed')
  expect(later).not.toHaveBeenCalled()
  expect(stream.fileList).toEqual([])
  expect(stream.meta).toEqual({ attempted: true })
})

test('dest writes context mutations, invokes onWrite, and returns the stream', async () => {
  const output = path.join(__dirname, 'output/context')
  const onWrite = jest.fn()
  const stream = majo().source('**/*', { baseDir, onWrite })
  stream.use(async context => {
    context.rename('a.txt', 'nested/result.txt')
    await context.transform('nested/result.txt', async () => 'generated')
  })
  try {
    expect(await stream.dest(output, { clean: true })).toBe(stream)
    expect(
      fs.readFileSync(path.join(output, 'nested/result.txt'), 'utf8')
    ).toBe('generated')
    expect(onWrite).toHaveBeenCalledWith(
      'nested/result.txt',
      path.join(output, 'nested/result.txt')
    )
    expect(stream.fileList).toEqual(['nested/result.txt'])
  } finally {
    await remove(output)
  }
})

test('separate streams never share contexts, files or metadata', async () => {
  const first = source()
  const second = source()
  first.use(context => {
    context.writeContents('a.txt', 'first')
    context.meta.owner = 'first'
  })
  second.use(context => {
    expect(context.meta.owner).toBeUndefined()
    expect(context.fileContents('a.txt')).not.toBe('first')
  })
  await Promise.all([first.process(), second.process()])
  expect(first.files).not.toBe(second.files)
  expect(first.meta).not.toBe(second.meta)
})

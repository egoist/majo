# API

```js
const stream = majo()
```

## stream.source(globs, [options])

### globs

Type: `Array` `string`<br>
Required: `true`

A glob pattern or an array of them, eg: `src/**/*.js`

### options

#### baseDir

Type: `string`<br>
Default: `.`

The directory to find source files by given glob patterns.

#### dotFiles

Type: `boolean`<br>
Default: `true`

Include dot files.

## stream.use(middleware)

### middleware

Type: `function`<br>
Required: `true`

Use a [middleware](./middleware.md).

## stream.dest(directory, [options])

Write files to disk and returns a Promise.

### directory

Type: `string`<br>
Required: `true`

The directory to write output files, could be an absolution path or relative path.

### options

#### baseDir

Type: `string`<br>
Default: `.`

If the `directory` is a relative path, it's manipulated relative to the `baseDir`.

#### clean

Type: `boolean`<br>
Default: `undefined`

Clean destination directory before writing files.

## stream.process()

Like `stream.dest` but does not write any files.

## stream.files

After you called `stream.process()` or `stream.dest()`, the `stream.files` will be an object whose each entry is a file path:

```js
{
  'src/index.js': {
    contents: Buffer<...>,
    stats: {}, // an fs.Stats object
    path: '/absolute/path/to/src/index.js'
  }
}
```

## stream.fileList

A getter which returns an array of relative paths to resulting files, eg:

```js
[
  '.gitignore',
  'src/index.js'
]
```

This is sorted by default using `Array.prototype.sort`.

## stream.filter(handler)

### handler(relative, file)

Return `true` to keep this file, `false` otherwise, taking two arguments:

#### relative

Relative path to this file.

#### file

An object which contains relevant file data:

```js
{
  contents: Buffer<...>,
  stats: {}, // fs.Stats object
  path: '/absolute/path/to/this/file'
}
```

## stream.meta

Type: `Object`<br>
Default: `{}`

An object which is shared across middlewares, you can use this to pass down data to middlewares.

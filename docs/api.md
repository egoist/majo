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

#### cwd

Type: `string`<br>
Default: `process.cwd()`

The directory to find source files by given glob patterns.

## stream.use(middleware)

### middleware

Type: `function`<br>
Required: `true`

Use a middleware.

## stream.dest(directory, [options])

Write files to disk and returns a Promise.

### directory

Type: `string`<br>
Required: `true`

The directory to write output files, could be an absolution path or relative path.

### options

#### cwd

Type: `string`<br>
Default: `process.cwd()`

If the dest directory is a relative path, it's manipulated relative to `cwd`.

## stream.process()

Like `stream.dest` but does not write any files.

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
  stat: {}, // fs.Stats object
  path: '/absolute/path/to/this/file'
}
```

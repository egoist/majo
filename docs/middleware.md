# Middleware

A middleware is a function that accepts `MajoFiles` instance as the first argument:

```js
function myMiddleware(majoFiles) {
  majoFiles.deleteFile('dist/bundle.js') // Remove a file
}
```

## majoFiles.meta

Type: `Object`<br>
Default: `{}`

An object which is shared across middlewares, you can use this to pass down data to middlewares.

## majoFiles.transform(relative, handler)

It should return a transformed `utf-8` string or a Promise which resolves such string.

### relative

Relative path.

### handler(decodedContents)

#### decodedContents

Type: `string`<br>
Encoding: `utf-8`

Decoded file content, a string in `utf-8` encoding.

## majoFiles.file(relative)

Get a file by given relative path.

## majoFiles.deleteFile(relative)

Delete a file by given relative path.

## majoFiles.createFile(relative, file)

Create a file.

## majoFiles.fileContents(relative)

Get decoded file contents by given relative path.

## majoFiles.writeContents(relative, contents)

Write decoded contents to a file by given relative path.

## majoFiles.fileStats(relative)

Get stats for a file by given relative path.

## majoFiles.rename(fromPath, toPath)

Rename a file.

## majoFiles.files

An object whose each property is a file path:

```js
{
  'src/index.js': {
    contents: Buffer<...>,
    stats: {}, // an fs.Stats object
    path: '/absolute/path/to/src/index.js'
  }
}
```

## majoFiles.fileList

A getter which returns an array of relative paths to resulting files, eg:

```js
[
  '.gitignore',
  'src/index.js'
]
```

This is sorted by default using `Array.prototype.sort`.
